# CLAUDE.md — DeskcommCRM

> **FORK (leia antes de tudo):** este clone é o fork `basharArif/DeskcommCRM`, produto separado
> (inglês primeiro, UI e marca próprias). Regras que **substituem** a "Higiene de branches" abaixo:
> `main` = espelho de `upstream/main`, **nunca commite nem abra PR a partir dela**; todo trabalho vai
> em `product` (ou branch dela). Atualizar = `bash scripts/sync-upstream.sh`, só merge, nunca rebase
> nem force. Detalhes, divergências deliberadas e checklist pós-sync em [`FORK.md`](FORK.md).

Leitura obrigatória antes de qualquer task de código. **Este arquivo é só a porta:** a doutrina (autoridade final sobre convenção e anti-pattern)
mora em `docs/doctrine/`, movida palavra por palavra (HQ-213) — abra o arquivo do tema na tabela antes de mexer. Em conflito com `AGENTS.md`, vale a doutrina.

**Stack:** Next.js 16 App Router + React 19 + TypeScript 6 estrito + Tailwind 4 (CSS-first) + shadcn/ui · Supabase (Postgres com RLS, Auth, Realtime, Storage) · WAHA NOWEB · Upstash Redis · Vercel AI Gateway · Zod · Sentry. Gerenciador: **pnpm**.

## Regras duras (resumo; o texto completo e o porquê estão nos arquivos abaixo)

1. **Multi-tenancy:** `organization_id` + RLS em toda tabela tenant-aware; handler com service role filtra `organization_id` à mão, de fonte confiável, **nunca do body**.
2. **Trigger Postgres NUNCA faz HTTP:** emite linha em `event_log`; um worker consome.
3. **Auth:** `getUser()`, nunca `getSession()` no backend; API key nunca em query string; bearer só como hash SHA256 no banco.
4. **Erro e audit:** mutação POST/PATCH/DELETE bem-sucedida grava 1 linha em `api_audit_log`; falha desse write alerta no Sentry e não bloqueia; sem `console.log` em código merged; Zod em todo input externo.
5. **Migrations:** toda mudança de schema = migration versionada + apêndice idempotente no `supabase/baseline.sql` + linha `-- manifest:` no `.sql`; nunca edite migration aplicada; função nova em `public` revoga `EXECUTE` de `public` e `anon`.
6. **Deploy:** VPS com proxy próprio sobe com `-f docker-compose.prod.yml -f docker-compose.traefik.yml`; depois `/` responde 200 e `/app` 307; a imagem é publicada pelo CI, nunca construída na VPS.
7. **Packaging:** nenhum serviço de produção `build:`-only; instalação aponta número de versão, nunca tag móvel; bump nunca exige edição manual de `.env` ou compose.
8. **Testes:** `pnpm test:unit` sem caminho; os invariantes (RLS) só rodam em `pnpm test:db` — rode-o ao tocar schema, RLS, RBAC ou webhooks; o exit code é a autoridade.
9. **UI:** provada pela tela como um leigo, em ambiente fresco estilo VPS, com evidência em `evidence/`; `curl` não conta.
10. **Pronto:** só com a Definition of Done inteira. Fato que muda (contagem, checks obrigatórios): rode o comando que a doutrina dá, não confie na prosa.

## Onde está cada tema

| Tema | Arquivo |
|---|---|
| Visão e stack canônica | [`visao-e-stack.md`](docs/doctrine/visao-e-stack.md) |
| Multi-tenancy, idempotência, API `/api/v1`, Auth/RBAC, audit log, LGPD | [`convencoes-criticas.md`](docs/doctrine/convencoes-criticas.md) |
| WAHA e marca própria (white-label) | [`waha-e-marca-propria.md`](docs/doctrine/waha-e-marca-propria.md) |
| DIRC e modelagem | [`modelagem.md`](docs/doctrine/modelagem.md) |
| Anti-patterns proibidos (numerados; testes e docs citam o número) | [`anti-patterns.md`](docs/doctrine/anti-patterns.md) |
| Paths importantes e como rodar local | [`caminhos-e-rodar-local.md`](docs/doctrine/caminhos-e-rodar-local.md) |
| Deploy em produção (VPS) | [`deploy-producao.md`](docs/doctrine/deploy-producao.md) |
| Packaging e Extensões | [`packaging-e-extensoes.md`](docs/doctrine/packaging-e-extensoes.md) |
| Testes e checks obrigatórios do CI | [`testes.md`](docs/doctrine/testes.md) |
| QA visual com recursos reais | [`qa-visual.md`](docs/doctrine/qa-visual.md) |
| Higiene de branches (substituída pelo aviso FORK acima) | [`higiene-de-branches.md`](docs/doctrine/higiene-de-branches.md) |
| Migrations e banco | [`migrations-e-banco.md`](docs/doctrine/migrations-e-banco.md) |
| Skills e guias | [`skills-e-guias.md`](docs/doctrine/skills-e-guias.md) |
| **Definition of Done** | [`definition-of-done.md`](docs/doctrine/definition-of-done.md) |
| Mapa de toda a documentação e regra de precedência | [`docs/index.md`](docs/index.md) |
| O que está pronto, incompleto e quebrado (leia antes de estimar) | [`docs/current-state.md`](docs/current-state.md) |
| Onde a verificação tem buraco: `pnpm gov:verify` não cobre `test:db` nem `test:e2e` | [`docs/harness-audit.md`](docs/harness-audit.md) |
| Superfície de ataque do self-host | [`docs/threat-model.md`](docs/threat-model.md) |
| Contrato portável para outros agentes (derivado da doutrina; confira se desatualizou ao mudá-la) | [`AGENTS.md`](AGENTS.md) |

Guias embutidos (`.agents/skills/`, espelho em `.claude/skills/`): `deskcomm-instalar`, `deskcomm-operacao`, `deskcomm-cliente-novo`, `deskcomm-metricas`, `deskcomm-prompt`, `deskcomm-contribuir`, `deskcomm-extensao`, `deskcomm-doutrina`.
