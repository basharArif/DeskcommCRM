# Convenções críticas: multi-tenancy, idempotência, API, Auth, audit log, LGPD

> Movido verbatim de `CLAUDE.md` (HQ-213, 2026-11-07); só os links relativos foram ajustados ao novo local. Porta e regras duras: [`CLAUDE.md`](../../CLAUDE.md).

## Convenções críticas (NÃO NEGOCIÁVEIS)

### Multi-tenancy
- `organization_id uuid not null references organizations(id) on delete cascade` em **toda** tabela tenant-aware
- RLS policy `tenant_isolation_<tabela>_all` aplicada via helper `fn_user_org_ids()`
- Service role bypassa RLS — handlers que usam admin client **DEVEM** filtrar `organization_id` manualmente, resolvido de fonte confiável (cookie/JWT/webhook secret/path token), **NUNCA do body**
- Toda query que cruza tabelas tenant-aware filtra `organization_id` explicitamente
- Teste de isolamento (cria 2 tenants, verifica não-vazamento) é obrigatório no CI antes de merge

### Idempotência & event sourcing leve
- Mensagens WhatsApp e eventos externos: `unique (organization_id, external_id)` + captura `code === '23505'` no INSERT
- POSTs de criação na API aceitam header `Idempotency-Key: <uuid>` (TTL 24h). O recibo mora no **Postgres** (`public.idempotency_keys`, único por organização + chave + endpoint), não no Upstash — ver `lib/api/idempotency.ts`. Quais rotas leem o header: `grep -rln 'Idempotency-Key' app/api/v1 --include='route.ts'`
- **Trigger Postgres NUNCA faz HTTP.** Trigger emite linha em `event_log`; worker (cron / Realtime listener) consome e dispara side effect

### API REST `/api/v1/`
- Versionamento por path. JSON snake_case. UUID v4. ISO-8601 UTC. Dinheiro em `_cents` + `currency` ISO-4217
- Wrapper sucesso: `{ data, meta?: { cursor, has_more, total } }`
- Wrapper erro: `{ error: { code, message, details? } }` — usar helpers `ok()` / `fail()` de `lib/api/wrappers.ts`
- Paginação: cursor opaco base64+HMAC por default
- **Auth dual é a direção do produto, e ela se cumpre rota por rota.** Cookie de sessão para o
  frontend; `Authorization: Bearer dsk_...` (linha de `api_tokens`, resolvida no servidor) para
  chamada de servidor. O prefixo é **`dsk_`**, e quem o exige é `lib/mcp/auth.ts` — `tok_` nunca
  existiu no código e estava escrito aqui, em `AGENTS.md` e na Spec 09 até 17/09/2026
  - O helper é `lib/api/auth-dual.ts`, e habilitar uma rota é **por rota**: não há chave geral.
    Para saber quais já aceitam bearer — o número muda, o comando não:
    `git grep -ln "auth-dual" -- app/api/v1` (mais `app/api/v1/contacts/route.ts`, que implementou
    o padrão inline e deu origem ao helper)
  - **Chamar o helper na rota não basta:** o `proxy.ts` global roda antes de qualquer handler e só
    reconhece cookie. Sem uma entrada em `lib/auth/public-paths.ts` para o caminho, todo bearer
    recebe 401 do proxy antes de chegar ao handler. "Público" ali quer dizer "o proxy não decide",
    nunca "sem autenticação"
  - Decisão do dono do produto em 17/09/2026: **converter as rotas que cada integração precisar**,
    conforme aparecerem, em vez de namespace paralelo por cliente. Uma rota convertida serve a todo
    integrador. Contexto: PR #1008, que escreveu 26 rotas paralelas porque não achou por onde entrar
- **API key NUNCA em query string** (vaza em logs Vercel/CF). Sempre header
- Plaintext de bearer token mostrado **uma vez** na criação; depois apenas hash SHA256 no DB
- Rate limit headers: `X-RateLimit-*` + `Retry-After` em 429
- `X-Request-Id` em toda response (correlaciona com audit log)

### Auth & RBAC
- Sempre `getUser()` (valida JWT no backend). NUNCA `getSession()` (confia no cookie local)
- 4 roles dentro do tenant: `viewer` (1) < `agent` (2) < `manager` (3) < `admin` (4)
- Super-admin de plataforma é uma role transversal — `is_platform_admin` (decisão final na Spec 01)
- MFA TOTP é **opcional e ligado por quem administra** — não é mais forçado por papel. Quem exige são duas políticas independentes que SOMAM: `platform_admins.mfa_required` (para o super-admin) e `organizations.settings.security.mfa_required` (com `mfa_required_min_role` escolhendo o nível mínimo — `admin` quando só o booleano legado existe — e `mfa_grace_days` de carência). O padrão de ambas é **não exigir**, e o `bootstrap-owner.ts` grava `false` explícito. Regra pura em `lib/auth/politica-mfa.ts`
  - **Por que mudou:** o gate era `isPlatformAdmin || role === "admin"`, sem opção, e o `install.sh` cria o dono como platform admin — então TODA instalação self-host recebia um bloqueador de tela cheia logo depois do onboarding, um passo que o wizard nunca anunciou. Decisão do dono do produto; segurança que expulsa o usuário na primeira tela não protege ninguém
  - **⚠️ CADASTRAR e PROVAR são perguntas diferentes.** A política decide o cadastro. Já `mfaEmDivida()` — o 403 `mfa_required` das rotas — NÃO consulta a política: quem TEM fator prova na sessão, sempre. Ligá-lo à política faria quem ativa a verificação por vontade própria ter o fator ignorado
  - Ligar/desligar vive em **Configurações › Segurança**; desligar o próprio fator exige sessão `aal2` (senão uma sessão roubada desliga a proteção com um clique)
- Permissão por pipeline (`user_pipeline_access`) **NÃO** entra no MVP
- Suporte temporário: todo handler mutante de `app/api/v1` declara `requireSupportWrite(`
  de `lib/impersonate/support.ts` **antes do efeito**. É guarda de efeito, não de papel — não substitui
  `requireRole`/RBAC/MFA — e é cobrada pelo gate `tests/unit/suporte-cobertura-de-efeitos.test.ts`

### Audit log
- Toda mutação POST/PATCH/DELETE bem-sucedida → 1 entrada em `api_audit_log` (fire-and-forget, p99 ≤500ms)
- **Rodada de cron que não fez nada NÃO é mutação e não audita** — e a que fez, audita. `routing-worker` (1×/min) e o extinto `attendant-heartbeat` (1×/5min, removido no #720) auditavam incondicionalmente: ~51.840 linhas/mês numa instalação que não atende ninguém, e numa VPS real **95% do audit log** era batida de cron vazia (`docs/testing/user-journey-map.md`, achado 17). A guarda certa é *auditar quando houve efeito*, nunca *parar de auditar* — as duas direções são medidas por `tests/unit/cron-audita-so-quando-ha-efeito.test.ts`, que varre o AST de **toda** rota de `app/api/v1/cron/`
- Audit é append-only para os papéis do PostgREST, e isso é do SCHEMA e não da prosa: `anon`, `authenticated` e `service_role` não têm GRANT de UPDATE, DELETE **nem TRUNCATE** em `api_audit_log` — **nem `service_role`** (migration 0258). O dono (`postgres`) pode tudo, como em qualquer tabela: a garantia é sobre os papéis que o PostgREST assume, nunca absoluta. Para conferir na fonte em vez de acreditar nesta linha:

  ```bash
  psql "$SUPABASE_DB_URL" -c "select grantee, privilege_type from information_schema.role_table_grants
    where table_schema='public' and table_name='api_audit_log'
      and privilege_type in ('DELETE','UPDATE','TRUNCATE')
      and grantee in ('anon','authenticated','service_role','PUBLIC');"
  ```

  O resultado esperado é **vazio**. Sem o filtro de `grantee` aparecem as linhas
  do dono `postgres` — e elas não são defeito.

  **Até a 0258 a primeira frase deste item era falsa no Supabase real, com o
  gate verde.** Todo projeto Supabase nasce com um default ACL de TABELAS em
  `public` que concede tudo aos três papéis — confira com
  `select defaclacl from pg_default_acl where defaclobjtype = 'r' and defaclnamespace = 'public'::regnamespace;`
  —, e o `GRANT` enumerado que o dump emite para esta tabela só ACRESCENTA, não
  retira. Com a service key, que ignora RLS, uma linha escolhida da auditoria
  era apagada ou reescrita pela REST; `anon`/`authenticated` só não o faziam
  porque a RLS não tem policy de UPDATE/DELETE.

  **A lição que sobrevive ao conserto é sobre a régua, não sobre o grant.** A
  sonda de `tests/invariants/retencao-poda-e-expurgo.test.ts` ficou verde duas
  vezes medindo o universo errado: primeiro perguntando só por DELETE/UPDATE com
  TRUNCATE concedido ao lado; depois perguntando pelos três num Postgres onde o
  prelude de `scripts/test-db.sh` reproduzia o default ACL do Supabase só para
  FUNÇÕES — um banco onde o defeito não podia existir. Desde a issue #887 o
  prelude reproduz também o de TABELAS, e aquela sonda passou a medir o Supabase.
  A prova com controle próprio segue sendo
  `tests/invariants/audit-log-sob-o-default-acl-do-supabase.test.ts`: concede o
  default ACL à tabela, reaplica o bloco da 0258 extraído do baseline e só então
  sonda. **Enumerar privilégios no dump não protege tabela nenhuma no Supabase
  real**; o que protege é `revoke` explícito no apêndice. Quais tabelas o dump
  enumera em vez de `GRANT ALL`:

  ```bash
  grep -nE '^GRANT [A-Z,]+ ON TABLE' supabase/baseline.sql | grep -v 'GRANT ALL'
  ```
- **Retenção default de 5 anos, configurável, e agora EXECUTADA.** O expurgo é `public.fn_expurgar_auditoria_vencida` (`security definer`, **piso de 90 dias dentro do corpo**, revogada de anon/authenticated), chamada em lotes pelo cron `app/api/v1/cron/data-retention` (diário). O knob é `AUDIT_LOG_RETENTION_DAYS`. **Não há camada cold/S3** — o "hot 90 dias, cold (S3) o resto" que este arquivo afirmava por meses nunca existiu em código (auditoria de 2026-08-14: zero ocorrência de arquivamento), e um self-host não tem para onde arquivar: o Storage do cliente é a MESMA cota de 1 GB, já dividida com `whatsapp-media`. Para ver o que está em vigor: `grep -n "RETENCAO_AUDITORIA_DIAS" lib/retencao/politica.ts`
- Por que uma `security definer` de expurgo não é porta de adulteração (o argumento inteiro está no cabeçalho da migration 0167): ela **não tem seletor de linha** — nenhum parâmetro de org, ator, ação ou id, e o único predicado é `created_at < now() - N dias`; o piso mora **no corpo**, não em quem chama; não é alcançável pela REST; é, desde a 0258, o **único** apagamento de auditoria ao alcance da service key — e não escolhe linha, só alcança a ponta mais velha que o piso; e **registra a própria erosão** (`retention.sweep_run`, com a contagem, numa linha nova demais para a chamada seguinte alcançar)
- Falha de write em audit gera alerta Sentry, não bloqueia mutação principal

### LGPD
- Anonimização preferida sobre delete. Nome do contato vira `Cliente Anonimizado #N`
- Cascade de redact: contact + conversations + messages (mídia removida do storage) + activities (preserva timestamps)
- Reversão de anonimização: 403 `lgpd_anonymization_irreversible`
- SLA: data_request entregue D+7; redact executado D+15
- Action audit obrigatória: `lgpd.data_request_received`, `lgpd.export_generated`, `lgpd.redact_executed`, `lgpd.consent_changed`
