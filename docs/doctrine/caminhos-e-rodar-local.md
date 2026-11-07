# Paths importantes e como rodar local

> Movido verbatim de `CLAUDE.md` (HQ-213, 2026-11-07); só os links relativos foram ajustados ao novo local. Porta e regras duras: [`CLAUDE.md`](../../CLAUDE.md).

## Paths importantes

| Path | Conteúdo |
|---|---|
| `docs/prd/00-prd-master.md` | Visão geral, escopo MVP, KPIs |
| `docs/prd/01-prd-platform-base.md` | Auth, tenancy, RBAC, LGPD framework |
| `docs/prd/02-...06-` | Customer 360, WhatsApp, Pipeline, IA-RAG, Nuvemshop |
| `docs/specs/` | Specs técnicas detalhadas (schema SQL, payloads exatos) |
| `docs/business-rules/` | Regras de negócio fora do código |
| `docs/research/reference-synthesis.md` | Arquitetura herdada do curso WAHA |
| `tasks/todo.md` | Workflow de construção atual |
| `app/globals.css` | **Tailwind 4 é CSS-first: não existe `tailwind.config.ts`.** Tokens em `:root` / `[data-theme]`, ponte token → utilitário no `@theme inline`, alcance do scanner nos `@source`. Vigiado por `tests/unit/tailwind-tokens.test.ts` |
| `lib/api/wrappers.ts` | `ok()`, `fail()`, tipos `ApiSuccess<T>` / `ApiError` |
| `lib/api/errors.ts` | Códigos de erro canônicos |
| `lib/env.ts` | Validação Zod das env vars (lança no startup se faltar crítica) |
| `lib/supabase/{browser,server,admin}.ts` | Clients canônicos |
| `app/api/v1/health/route.ts` | Health check (Supabase + Redis + WAHA) |
| `supabase/migrations/` | Schema versionado |
| `docs/runbooks/deploy.md` | **Deploy em produção — leia ANTES de mexer na VPS** |

## Como rodar local

```bash
nvm use                    # node 22
pnpm install               # o gerenciador é pnpm (packageManager no package.json), não npm
cp .env.example .env.local  # preencher
docker compose up -d        # WAHA local
pnpm dev                    # http://localhost:3000
pnpm worker                 # agent-worker (processo separado do Next)
pnpm dev:crons              # chama localmente só os crons de PATHS em scripts/dev-crons.ts (não todos)
```

Schema: aplique `supabase/baseline.sql`, **não** as migrations (a cadeia não sobe do zero).
Stack local completa (Supabase via `scripts/local-supabase.sh`; app, worker, scheduler, WAHA e Redis via `docker-compose.local.yml`), depois de rodar
`./ubuntu-local-installer.sh` uma vez: `pnpm local:up | local:down | local:status | local:logs`.
Ver `README.md` pra detalhes de setup.
