English condensed translation of ARCHITECTURE.md.

# Architecture — DeskcommCRM

> One-page view. Depth lives in `docs/specs/` and `docs/stories/epics/MASTER.md`.
> Documentation map: [`docs/index.md`](../index.md). Real implementation state: [`docs/current-state.md`](../current-state.md).

## Layers

- **App (Next.js 16 App Router):** UI + Route Handlers in the same repo. Server Components by default, Client where state is needed. Edge middleware is `proxy.ts` (Next 16 renamed `middleware.ts` to `proxy.ts`).
- **DB (Supabase Postgres):** RLS on every tenant-aware table via `fn_user_org_ids()`. Versioned migrations in `supabase/migrations/`.
- **Auth (Supabase Auth + `@supabase/ssr`):** SameSite=Strict cookie. Always `getUser()` on the server, never `getSession()`. **TOTP MFA is optional and switched on by whoever administers**: two independent policies that add up (`platform_admins.mfa_required` and `organizations.settings.security.mfa_required`), both defaulting to **not required**. Pure rule in `lib/auth/politica-mfa.ts`. (Reason: `install.sh` creates the owner as platform admin, so forced MFA blocked every self-host install right after onboarding.) Enrolling and proving are different: anyone who HAS a factor always proves it in the session, regardless of policy.
- **Realtime (Supabase Realtime):** `postgres_changes` for inbox/kanban; `broadcast` for light signals.
- **Storage (Supabase Storage):** private `whatsapp-media` bucket, signed URLs.
- **WhatsApp (WAHA Plus / NOWEB engine):** HMAC-SHA512 webhooks; anti-ban throttle; STOP detection.
- **Queues (light event sourcing):** `event_log` table + cron workers. A Postgres trigger NEVER makes HTTP calls.
- **Rate limit (Upstash Redis):** **fixed-window** counter (`INCR` + `EXPIRE`) in `lib/ai/dispatcher/rate-limit.ts`, with in-memory fallback when Redis is absent. Warning: applied in only 2 places today (capture webhook and AI dispatcher); the public auth surface has none. See [`docs/threat-model.md`](../threat-model.md) section T1.
- **AI (Vercel AI Gateway):** Anthropic primary, OpenAI backup for embeddings.
- **Observability (Sentry):** `beforeSend` scrubs PII (CPF/email/phone) and sensitive headers.

## Multi-tenancy

`organization_id uuid not null` on every tenant-aware table. RLS via helper. The service role bypasses RLS, so admin handlers **MUST** filter `organization_id` manually, resolved from a trusted source (cookie/JWT/webhook secret/path token), never from the body.

Details: [`docs/specs/01-spec-platform-base.md`](../specs/01-spec-platform-base.md).

## REST API `/api/v1/`

- JSON snake_case. UUID v4. ISO-8601 UTC. Money as `_cents` + `currency`.
- `ok()` / `fail()` wrappers in `lib/api/wrappers.ts`.
- Dual auth: session cookie (frontend) or `Authorization: Bearer dsk_...` (server-to-server; the source of the current prefix is `lib/mcp/auth.ts`, the original text said `tok_...`).
- `X-Request-Id` on every response, injected in `proxy.ts` and correlated with the audit log.
- `Idempotency-Key` is the contract for creation POSTs. Two routes store a receipt (`lgpd/requests/[id]/approve` and `admin/tenants`), and the reusable helper `lib/api/idempotency.ts` is applied to `message-templates`. It does **not** yet cover other creation routes and does not close the race between simultaneous requests with the same key (needs a schema change, issue #778). Measure instead of quoting: `grep -rln 'Idempotency-Key' app/api/v1 --include='route.ts'`.
- Details: [`docs/specs/01-spec-platform-base.md`](../specs/01-spec-platform-base.md) (API section).

## Request flow

**Authenticated tenant route** (`/api/v1/*`, 166 handlers):

```
request → proxy.ts (X-Request-Id, x-pathname; isPublicPath? → bypass;
                    otherwise validates Supabase session via cookie sb-deskcomm-auth)
        → route handler:
             1. Zod validates external input
             2. guard: requireRole() | requirePlatformAdmin() | secret/HMAC
             3. resolveActiveOrg() → organization_id from trusted source (never the body)
             4. query (RLS via session client, or manual org filter with service role)
             5. audit() fire-and-forget if there was a mutation
             6. ok(data, meta) | fail(code, message, status)
```

**Non-cookie surfaces:** `/api/v1/cron/*` (Bearer `INTERNAL_CRON_SECRET`, fail-closed), `/api/internal/*` (`x-internal-secret`), `/api/mcp` (Bearer token against `api_tokens`), `/api/v1/webhooks/*` (HMAC + path token). Full inventory in [`docs/threat-model.md`](../threat-model.md) section 1.

**AI agent turn:** WhatsApp inbound → HMAC + idempotency → `event_log` → worker → `runAgentTurn` (RAG + MCP tools) → before-send guardrails → WAHA adapter → human handoff if triggered. Diagram: [`docs/architecture/agent-turn.html`](../architecture/agent-turn.html).

## Event log + workers

Postgres triggers emit rows into `event_log`. Workers (cron / Realtime listener) consume them and fire side effects. Idempotency via `unique (organization_id, external_id)` + catching `code === '23505'`.

Workers live in `workers/` (`ai-response`, `ai-sentiment`, `rag-indexer`, `media-persist`, `media-derive`, `lgpd-export`, `lgpd-redact`, `storage-cleanup`, `agent-worker`), drained by the 10 endpoints in `app/api/v1/cron/`. Contract: [`docs/specs/07-spec-events-workers.md`](../specs/07-spec-events-workers.md).

## External integrations

| Service | Use | Where | If missing |
|---|---|---|---|
| **Supabase** | Postgres + Auth + Realtime + Storage | `lib/supabase/{browser,server,admin}.ts` | app does not start (always required) |
| **WAHA Plus** (NOWEB) | WhatsApp: send, receive, multi-number sessions | `lib/waha/` | channel unavailable; required in production |
| **Upstash Redis** | rate limit + RAG debounce | `lib/ai/dispatcher/rate-limit.ts`, `lib/ai/rag/debounce.ts` | degrades to memory with `warn` |
| **Vercel AI Gateway** | LLM + embeddings (`@ai-sdk/anthropic\|openai\|google`) | `lib/ai/` | agent does not respond |
| **Nuvemshop** | e-commerce: orders, products, LGPD webhooks | `lib/nuvemshop/` | optional (`NUVEMSHOP_ENABLED`) |
| **Sentry** | errors + performance, `beforeSend` sanitizes PII | `sentry.*.config.ts`, `instrumentation*.ts` | optional |
| **Resend** | transactional e-mail (team invite) | `lib/email/` | optional; invite falls back to copy-to-clipboard |
| **MCP** | CRM exposed as tools for agents | `app/api/mcp/`, `lib/mcp/` | n/a |

## Hardening

- Error boundaries in `app/error.tsx`, `app/app/error.tsx`, `app/(public)/error.tsx`, `app/global-error.tsx` (Sentry capture + visible eventId).
- Custom 404/403/500/503 pages with canonical copy.
- Loading skeletons on P0 routes.
- Playwright E2E + axe-core.
- Details: [`docs/stories/epics/EPIC-12-hardening.md`](../stories/epics/EPIC-12-hardening.md).

## Where to look deeper

- [`docs/prd/`](../prd/): PRDs (vision, MVP scope, KPIs, platform base, customer 360, WhatsApp, pipeline, AI-RAG, Nuvemshop).
- [`docs/specs/`](../specs/): technical specs with SQL schema and payloads.
- [`docs/business-rules/`](../business-rules/): business rules outside the code.
- [`docs/stories/epics/MASTER.md`](../stories/epics/MASTER.md): execution plan by epic/wave.
- [`CLAUDE.md`](../../CLAUDE.md): non-negotiable conventions (multi-tenancy, idempotency, RBAC, LGPD, WAHA, anti-patterns).
- [`AGENTS.md`](../../AGENTS.md): portable contract for coding agents (any tool).
- [`docs/index.md`](../index.md): documentation index.
- [`docs/harness-audit.md`](../harness-audit.md): harness maturity and verification gaps.
- [`docs/threat-model.md`](../threat-model.md): self-host attack surface.
