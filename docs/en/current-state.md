English condensed translation of docs/current-state.md.

---
type: current-state
project: DeskcommCRM
status: draft
last_updated: 2026-07-29
confidence: medium-high (code metrics CONFIRMED; epic state comes from HANDOFFs, which are self-reported)
audited_against: origin/main @ 789dfa6 (v1.0.0, 2026-07-29)
---

# Current state — DeskcommCRM

> **THIS DOCUMENT IS A SNAPSHOT, NOT TODAY'S STATE.**
> It describes `origin/main` at commit `789dfa6` (v1.0.0, 2026-07-29). Numbers, counts and verdicts match **that commit**, not the current `main` (1,014 commits and 71 migrations later, as measured on 2026-08-14). It is deliberately not maintained: a dated snapshot never lies, while a document updated once starts lying again the next week. Re-measure before acting on any line. An audit on 2026-08-14 found 40 outdated claims in this file alone; measurement commands are in [`audits/2026-08-14-afirmacoes-de-estado.md`](../audits/2026-08-14-afirmacoes-de-estado.md).
>
> ```bash
> gh api repos/melgarafael/DeskcommCRM/branches/main/protection \
>   --jq '.required_status_checks.contexts'      # required checks
> pnpm typecheck && pnpm lint && pnpm lint:channels && pnpm test:unit && pnpm test:shell
> ```

Purpose: "what is done" was scattered across 5 `HANDOFF-*.md` files, `plan/progress.md`, `loop/checkpoints/`, `tasks/todo.md` and the README roadmap. A new agent could not answer "can I ship this?" without reading ~1,500 lines.

**Method caveat:** epic state comes from HANDOFFs, self-reported by the sessions that did the work. They are dense with evidence (test output, screenshots) but were not re-verified by execution (the audit was read-only). Code metrics, file counts, CI content and pattern coverage **were** verified directly. Section 1 counts were re-measured by a maintainer on 2026-07-30 (`origin/main` @ `b190bbf`, PR #60); epic state (sections 2-3) was not.

## 1. Repository numbers (CONFIRMED)

**Version:** `1.0.0`, tagged 2026-07-27 (`CHANGELOG.md`), the first versioned release; public development since April 2026 without tags.

| Metric | Value |
|---|---|
| TS/TSX files in `app`+`lib`+`components`+`workers` | 987 |
| Route handlers (`app/api/**/route.ts`) | 169 |
| Migrations in `supabase/migrations/` | 81 files, up to `0092_stage_names_acentos` |
| Unit tests (`*.test.ts(x)`) | 221 files |
| DB invariants (`tests/invariants/`) | 56 files |
| E2E specs (`tests/e2e/`) | 19 |
| `.md` documents in `docs/` | 119 (23 subfolders) |
| Import cycles | **0** (graphify, older tree) |
| `console.log` outside `lib/logger.ts` | **0** |
| `: any` / `as any` | 7 |

Code hygiene is good: zero cycles, centralized logger respected, almost no `any`. The graph's god nodes (`fail` 325 edges, `createAdminClient` 323, `ok` 305, `audit` 290, `requireRole` 230) are canonical helpers, meaning convention is applied, not accidental coupling.

The migration doctrine is being followed: the idempotent appendix of `baseline.sql` covers up to migration `0092`, the last in `supabase/migrations/`, so self-host kits receive schema changes.

## 2. What is delivered

Per the README roadmap (INFERRED as accurate; each item has code and tests in the repo):

- **Foundation and platform:** auth with MFA for admin, multi-tenancy with RLS + isolation test, 4-role RBAC, append-only audit log, tenant onboarding.
- **WhatsApp support:** real-time 3-panel Inbox, multi-number WAHA connections, media via Storage, anti-ban (throttle + jitter + time window), STOP detection.
- **CRM and orders:** kanban with niche-configurable vocabulary (fractional indexing), customer 360, contacts, tags, Nuvemshop.
- **Native AI:** agents with per-tenant RAG (pgvector), sentiment, AI-to-human handoff, per-org budget, internal MCP server.
- **LGPD:** export and redact via workers, cascading anonymization, audited consent.
- **Self-host:** `hostgator-setup-kit`, self-healing `baseline.sql`, production runbook.
- **Webhooks and automation:** capture + WHEN/IF/THEN rules + external triggers.
- **Visible operation:** transparency of the anti-ban hold reason, Notification Center, send-protection knobs, flywheel proposals with human gate.

### Support Governance epic (G1-G6): COMPLETE

CONFIRMED in `plan/features.json` (31/31 features `passes: true`) and `loop/checkpoints/` (G1-G6 reports + 6 `.approved` files). Guided by 100+ DB invariants. Closed 2026-07-18. Delivered: server-side RBAC across the API, audited assignment and transfer (AI as first-class assignee), role-based visibility via RLS, per-agent metrics, automatic routing with queue and management panel, and `docs/specs/14`, the governance contract for external AI agents.

## 3. What is incomplete, by epic

| Epic | Reported state | What is missing |
|---|---|---|
| **Smart follow-up** (`HANDOFF.md`) | Waves 1-7 done; Wave 8 **in progress** (8.1 silence trigger done, 8.3 E2E journey done) | `stage_change` trigger, flywheel, and closing the 8.3 DoD/PRD checklist |
| **Harness evolution** (`HANDOFF-harness-evolution.md`) | **EPIC COMPLETE**: Phases 0-4 closed, the last (Evolution Panel) on 2026-07-27. Two more continuations delivered: agent pipeline mapping (Jul 27) and pipeline stage management (Jul 28) | **One open proof, owned by the owner:** nobody sent a real WhatsApp message closing the full cycle. A 1-minute recipe is at the end of the HANDOFF |
| **Visible operation** (`HANDOFF-operacao-visivel.md`) | F1, F2(i), F2(ii), F3 done on localhost with Playwright evidence | VPS proof after publishing (each feature needs double proof: localhost **and** VPS) |
| **Human cases** (`docs/handoffs/HANDOFF-casos-humanos.md`) | Waves 1-6 done and reviewed; Wave 7 (E2E proof) reported PARTIAL, interrupted by API limit, not a bug | TO CONFIRM whether it closed (HANDOFF moved from root to `docs/handoffs/`, usually a sign the epic ended) |
| **Multimodal Inbox** (`docs/handoffs/HANDOFF-inbox-multimodal.md`) | Waves 0-3.1 done with real proof (real WhatsApp, real media) | TO CONFIRM waves 4-6. **External blockers worth revalidating:** the Google key was a gateway key (real Gemini unreachable) and the Anthropic credential was a placeholder (`last4 1234`); the multimodal agent was proven only on OpenAI/gpt-4o |
| **Phase FG / Vendaval** | Not started | Trigger was G6 approval, which exists (`G6.approved`). The README no longer lists FG under "Next"; TO CONFIRM whether it left scope or was absorbed |

### Next on the roadmap (not started; CONFIRMED in README)

Public MCP, self-improvement flywheel, niche templates (clinic, real estate, info-product, services), VTEX and Shopify via adapter, probabilistic identity.

### Two product findings recorded and unaddressed

From `HANDOFF-harness-evolution.md`, noted as "not part of this feature": **layout overflow at 390px on any screen** and **no pipeline-creation path** (only stages). The first is a mobile first-impression bug.

## 4. What is broken or fragile (CONFIRMED)

### 4.0 The AI agent never received updates (critical): RESOLVED 2026-08-13

Lasted two months, hit **every** installation, and nothing on screen, in logs or in CI showed it. The `worker` service in `docker-compose.prod.yml` (the AI agent runtime and sole consumer of `ai_agent.dispatch_requested`) had no `image:`, only `build:`. A `build:`-only service is skipped by `docker compose pull` and immune to `up -d` without `--build`, so it was built on the customer's VPS at install time and **no `update.sh` ever rebuilt it**. Meanwhile `CLAUDE.md` claimed the normal path builds nothing on the VPS (true for the app, false for the product).

Resolved by publishing `deskcomm-worker` and `deskcomm-scheduler` as images, gated by `tests/unit/packaging-artefato-do-cliente.test.ts`. Law in [`doctrine/packaging.md`](../doctrine/packaging.md); decisions in [`adr/0001-packaging-e-distribuicao.md`](../adr/0001-packaging-e-distribuicao.md).

**Still open:** no *automated* update rehearsal on a real VPS. Case U6 of [`testing/user-journey-map.md`](../testing/user-journey-map.md) was run by hand on 2026-08-13.

### 4.1 E2E barely ran in CI (partially resolved 2026-07-30)

Latest status: as of 2026-09-19 (PR #983), `vps-fresh-onboarding` runs in CI (`SPECS_PARTE_4` of `e2e.yml`, alone in its part). A caveat holds: a PR that does not reach `e2e` (rule in `scripts/pr-alcanca-o-e2e.sh`) skips the parts, and there a green check proves no screen. Measure what stays out:

```bash
git show origin/main:.github/workflows/e2e.yml | \
  python3 -c "import sys,re; y=sys.stdin.read(); print(sorted({s for _,c in re.findall(r'(FORA_DO_CI):\s*>-\n((?:[ ]{8,}.*\n)+)',y) for s in re.findall(r'[a-z0-9-]+\.spec\.ts',c)}))"
```

History: on 2026-08-05 (issue #63) `e2e.yml` ran 28 of 32 specs against local Supabase with `baseline.sql` applied; its first real run found the `/500` page that `public-paths.ts` declared public but never existed, and running the 12 IA 360 specs surfaced a real product defect (`capacidades-do-agente`: the 20-capability cap disables the critical capability the design says to check by hand). By 2026-08-14 it ran 45 of 46 specs, and `e2e` has been a required check since 2026-08-08 (with `verify`, `build-and-size`, `invariants`, `imagens-ok`; **five** total).

The RLS isolation gate **runs**: `ci.yml` has an `invariants` job calling `pnpm test:db` (pgvector pg17, `baseline.sql` in install and update mode, all 56 files in `tests/invariants/`).

`vitest.config.ts:12` excludes `tests/invariants/**` and `tests/e2e/**` from `test:unit`. For invariants that is deliberate (the CI job covers them); E2E is covered by `e2e.yml`.

### 4.2 `pnpm gov:verify` is not the single command it looks like

`gov:verify` = `typecheck && lint && test:unit`. It omits `test:db` and `test:e2e`. An agent treating green `gov:verify` as "done" can declare a schema change complete without ever testing RLS. CI catches `test:db` after push, but the local loop misleads.

### 4.3 HTTP rate limit practically absent (critical)

`checkRateLimit` (`lib/ai/dispatcher/rate-limit.ts`) is called in **2** places: the public capture webhook and the AI dispatcher. Unprotected: `/login`, `/signup`, `/team/accept-invite/:token`, crons, `/api/internal/*`, `/api/mcp`, WAHA and Nuvemshop webhooks. See [`threat-model.md`](../threat-model.md).

### 4.4 Incomplete `node_modules` in the audited checkout

70 packages, no `typescript`; `pnpm typecheck` fails with `MODULE_NOT_FOUND`. Fixed by `pnpm install` (not run; read-only audit). So no claim that "tests pass" could be verified by execution.

### 4.5 Incomplete `.env.example`

6 variables declared in `lib/env.ts` are absent from the template, including **three secrets**: `IMPERSONATE_COOKIE_SECRET`, `INTERNAL_CRON_SECRET`, `LGPD_SIGNING_KEY` (plus `LGPD_DPO_EMAIL`, `LGPD_EXPORT_EXPIRES_HOURS`, `NUVEMSHOP_ENABLED`). Installers do not learn they need them until something fails. Violates DoD item 9. Conversely (less severe): `FLYWHEEL_*` and `WATCHDOG_*` are in the template (commented) but not in `lib/env.ts`, read straight from `process.env` with no Zod validation.

### 4.6 `ARCHITECTURE.md` had three false claims (corrected)

It said Next.js 15 (is 16.2), "sliding window rate limit" (is fixed-window, in only 2 places), and "`Idempotency-Key` for creation POSTs" (existed on **1** route). Documentation promising a nonexistent guarantee is worse than none.

### 4.7 No automatic secret-leak protection

No gitleaks/trufflehog in CI, no pre-commit hook. `.gitignore` covers `.env*`; that is the only layer.

### 4.8 Repo root: resolved

Root PNG evidence was moved: zero tracked PNGs at root; evidence lives in `evidence/` (85), `docs/evidence/` (18) and `loop/checkpoints/evidence/` (13), 116 total. Two HANDOFFs moved to `docs/handoffs/`; 3 remain at root (`HANDOFF.md`, `-harness-evolution`, `-operacao-visivel`): live epics stay visible, closed ones are archived.

### 4.9 HANDOFF state drift

`HANDOFF.md` says "next free migration: **0058**" and lists applying `0057` to the dev DB as pending, but the repo has migrations up to **0092**. Lesson: **a HANDOFF is not the source of truth for schema**; `supabase/migrations/` and `baseline.sql` are. TO CONFIRM whether the `0057` dev-DB item still exists.

## 5. Open technical risks

1. **89 of 169 handlers use `createAdminClient`** (service role, bypasses RLS). The rule "filter `organization_id` manually, never from the body" has no automatic write-time enforcement; it is human review. The 56 invariant files cover isolation seriously and run in CI, which mitigates a lot. Missing is a gate (lint rule or diff test) stopping a new handler from being born wrong. A mistake here is a cross-tenant leak, the product's worst failure mode.
2. **In-memory rate-limit fallback** (`rate-limit.ts:23`): without Upstash (the normal first-deploy state) the limit is per process, silent beyond a `logger.warn`.
3. **`ffmpeg` in the image**: resolved. `Dockerfile:55` runs `apk add --no-cache ffmpeg`; video derivation runs in the app process via the `event-log-drain` cron.
4. **Third-party credential dependence for proving AI:** if Anthropic still has a placeholder credential and Google an invalid gateway key, the multimodal path is proven on one provider (OpenAI) though the design is model-agnostic. TO CONFIRM if still valid.
5. **`lib/agent-engine/agent/inbound-turn.ts` has 1,789 lines**, 2.4x the second-largest logic file (`AgentForm.tsx`, 746), and it is the product's hot path.
6. **A stopped cron raises no error; the screen just goes stale and the queue just does not move.** On self-host the ticker is `crond` in the `scheduler` service, and the route list lives in `docker/scheduler/entrypoint.sh`, not `docker-compose.prod.yml` (current list: `grep -oE 'api/v1/cron/[a-z0-9-]+' docker/scheduler/entrypoint.sh | sort -u`). Each line discards `curl` output (`>/dev/null 2>&1`), so a tick's result never reaches the scheduler log. Installs without their own scheduler have a second path running **part** of these tasks inside the app process (`lib/relogio/executar.ts`). The fence is `tests/unit/cron-routes-scheduled.test.ts`, comparing `app/api/v1/cron/` with the crontab in both directions. **Decided 2026-09-17:** operation is VPS installation and Vercel keeps only the landing page; the CRM's Vercel project was unlinked from GitHub, and `vercel.ts` (that target's cron inventory) and its guard were removed. To verify the unlink, check the last `main` commit's statuses (a `Vercel` check appeared while linked): `gh api repos/melgarafael/DeskcommCRM/commits/main/status --jq '[.statuses[].context]'`.

## 6. Questions for the owner

1. Priority for "minimally starting the system": close Follow-up Wave 8, the real WhatsApp proof left open by the harness epic, or stabilize security (rate limit) first?
2. Did Phase FG (Vendaval) leave scope? `G6.approved` exists and the README no longer lists it under "Next". Do `docs/vendaval-fusion-plan.md` and `docs/vendaval-vps-deploy-comandos.md` still apply?
3. Did Human Cases Wave 7 and Multimodal Inbox waves 4-6 close? HANDOFFs were archived to `docs/handoffs/` (suggesting yes) but their text still says PARTIAL.
4. Were the Anthropic credential and the direct Google AI Studio key provided?
5. When do the two unaddressed product findings (390px overflow, no pipeline creation) get scheduled? The first is a mobile first-impression bug.
6. Should `pnpm gov:verify` include `test:db` (needs Docker on every dev machine) or stay a separate `verify:full`?
7. Do branch protection rules require the CI checks green to merge? This decides whether the RLS gate is blocking or decorative.

## 7. Could not be confirmed

- Whether `pnpm typecheck` / `lint` / `test:unit` pass **today** (incomplete `node_modules`; audit does not install).
- Whether the CI `invariants` job is passing (it exists; not known to be green).
- Whether E2E passes today (needs Docker, database and running app).
- Real dev/production database state (no connection opened).
- Test counts cited in HANDOFFs (533 unit, 236 db, 547 unit at different dates): self-reported and mutually inconsistent. Counted **221** unit and **56** invariant files, consistent with 1,000+ cases but not validating any specific number.
- Test coverage %: `coverage` is configured in Vitest but no report was generated.
- Whether `docs/architecture/` meets the "living map" required by DoD item 13 (it then held only the agent-turn diagram).
- Real completion state of archived epics (see question 3).

## 8. Method note

The first audit pass ran against a checkout **556 commits behind** `origin/main`, so it reported as its main finding an issue already fixed in production (RLS gate outside CI) and described the harness epic as "Phase 0, Task 1" when it was complete. Everything above was recounted against `origin/main @ 789dfa6`. Lessons for maintainers:

1. **`git fetch` before auditing.** The branch-hygiene doctrine in `CLAUDE.md` exists for this.
2. **This file rots fast.** Treat the frontmatter dates as an expiry date, and re-check numbers with the cited commands instead of trusting the table.
