# Plan — English first, then multi-language (fork: basharArif/DeskcommCRM)

Status: **not started** · Written 2026-09-23 · Owner: basharArif
Goal: the product runs **in English by default** on this fork, and the path to add more
languages (Bangla next, likely) is a registry line + a JSON catalog, not a code hunt.

Read this whole file before touching code. Each phase ends with a commit and a green
verification; a fresh session should be able to resume at any phase by reading the
**Progress log** at the bottom.

---

## 0. Facts measured on 2026-09-23 (main@16a570096) — re-measure, don't trust

| Fact | Where | How to re-check |
|---|---|---|
| UI languages served: `pt-BR` (source), `es` (complete). `zh-CN` registered but hidden (`em_construcao`). **No `en`.** | `lib/i18n/registro.ts` → `REGISTRO_DE_IDIOMAS` | `grep -n 'codigo:' lib/i18n/registro.ts` |
| Keys are the **Portuguese sentence itself**, not symbolic ids. Missing translation falls back to Portuguese. | `lib/i18n/dicionario.ts` → `traduzir()` | `sed -n '/export function traduzir/,/^}/p' lib/i18n/dicionario.ts` |
| Dictionary is one ~11.6k-line TS file with **7,333** entries (all with `es`) | `lib/i18n/dicionario.ts` | `pnpm exec tsx -e "import { DICIONARIO } from './lib/i18n/dicionario'; console.log(Object.keys(DICIONARIO).length);"` |
| `lib/i18n/traducoes/zh-CN.json` exists (flat `{ "pt text": "translation" }` with **5,384** entries) but **no code loads it yet** | `lib/i18n/traducoes/` | `grep -rn 'traducoes/' lib app components --include=*.ts*` |
| Client hook `useT()`; ~418 `.tsx` files call `t("...")` across **5,570** distinct keys in code | `lib/i18n/IdiomaProvider.tsx` | `pnpm exec tsx scripts/i18n-inventario.ts` |
| Locale chain: `user_metadata.locale` → support session → `organizations.locale` → `IDIOMA_PADRAO` (`pt-BR`) | `lib/auth/server.ts` (~L253), `lib/i18n/idiomas.ts` | |
| `organizations.locale` column exists | DB | `select locale from organizations` |
| Bootstrap only accepts `pt-BR`/`es`; `APP_LOCALE=en` silently becomes `pt-BR` | `scripts/bootstrap-owner.ts` (`IDIOMAS_SERVIDOS`) | |
| Installer asks 1=pt / 2=es | `hostgator-setup-kit/install.sh` | `grep -n 'pt-BR' hostgator-setup-kit/install.sh` |
| Dates: exhaustive `Record<Idioma, Locale>` (compiler forces a new entry) | `lib/i18n/datas.ts` → `LOCALE_DE_DATA` | |
| Numbers/money: **38 hard-coded** `toLocaleString("pt-BR")` / `Intl.NumberFormat("pt-BR")` | `lib/money.ts`, inbox, `KanbanCard`, `LeadDossier`, `StageColumn`… | `grep -rn 'toLocaleString("pt-BR"\|Intl.NumberFormat("pt-BR"' lib app components --include=*.ts*` |
| UI coverage gates | `tests/unit/i18n-*.test.ts` (4 files); `i18n-espanhol-cobre-a-tela` fails any `t()` key without `es` and any Portuguese prose outside `t()` | `ls tests/unit \| grep i18n` |
| Translation "seal" (detects stale translations after pt text changes) | `scripts/selar-traducao.ts` + `.selo.ts` | |

Surfaces that are **not** in the dictionary (Portuguese lives in code/DB):
e-mail templates (`lib/email/templates/`), notifications (`lib/notifications/`), API error
messages (`lib/api/errors.ts`), AI system prompts & defaults (`lib/ai/render-system-prompt.ts`,
`lib/ai/**`), cron/automation messages sent to leads, LGPD PDF, seed data in
`supabase/baseline.sql` (pipeline/stage names, vocabulary, "Cliente Anonimizado #N"),
opt-out detection vocabulary (`lib/opt-out/deteccao.ts`, pt + es only), installer text.

### Already in place — reuse, don't rebuild (checked 2026-09-23)

Upstream already shipped the first slice of the #755 design ("PROG-022"). Existing pieces:

| Piece | Where | Implication for this plan |
|---|---|---|
| Registry with levels `em_construcao` / `telas_principais` / `completo`; `Idioma` type only includes visible ones | `lib/i18n/registro.ts` | Phase 1 "add `en`" = one registry entry, not new mechanism |
| Visibility gate: a language only appears where the registry allows | `tests/unit/idioma-aparece-pelo-nivel-do-registro.test.tsx` | Selector/profile/tenant forms already derive from registry |
| JSON catalog **shape** gate (empty values, lost `{placeholders}`, bad date patterns) — completeness deliberately NOT enforced | `tests/unit/catalogo-de-idioma-tem-forma.test.ts` | `en.json` gets validated for free once it exists. Only the **loader** is missing |
| Stale-translation seal | `tests/unit/traducao-nao-defasa.test.ts`, `scripts/selar-traducao.ts` | Extend to `en`, don't write a new one |
| Other gates: menu catalog, date follows language, `lang` attr follows language, UI-language resolution, extraction errors | `tests/unit/i18n-*.test.ts`, `idioma-da-interface.test.ts`, `agenda-e-lang-seguem-o-idioma.test.tsx` | Run them in every phase |
| Language switch action + top selector + pre-login language from `Accept-Language` | `app/actions/settings/trocarIdioma.ts`, `components/shell/SeletorDeIdioma.tsx`, `lib/i18n/idiomaAnonimo.ts` | No new UI needed for switching |
| **Per-lead language** `contacts.locale` (migration 0098); lead-facing messages resolve `contact.locale ?? organization.locale`; AI prompt receives `{{contact_locale}}` | `lib/agent-engine/agent/meet-delivery.ts:119`, `lib/ai/render-system-prompt.ts` | D4 corrected below: lead language first, then org |
| Org currency + timezone already selectable (BRL/USD/MXN…) | `organizations.currency/timezone`, `lib/money.ts` | Phase 2 only changes *formatting*, not currency |
| **Country profile per organization** (#1033 → PR #1135, migration 0277): contact document type, PII patterns for the AI anonymizer, privacy-law citation in the LGPD PDF, business-day calendar | `lib/legal/perfil-do-pais.ts` | Only `BR` exists; unknown country degrades to BR. This is a **separate track** from language (see Phase 7b) |

Open upstream items that touch this work: **#603** (Spanish gate blind to dynamic keys — the
inventory found 747 unresolved dynamic `t()` sites; those strings will silently stay
Portuguese in English too), **#890** (English docs). Chinese PR #773 was **closed unmerged**; its
`zh-CN.json` remained in the tree.

Numbers re-checked and confirmed on 2026-09-23:
The 83 keys without `es` in the total code scan consist of:
- 74 error/status messages inside `app/api/**` (route handlers, API error responses), which are intentionally excluded from the UI gate by `PASTAS_IGNORADAS = ["api"]` in `tests/unit/i18n-espanhol-cobre-a-tela.test.ts`.
- 9 dynamic property access expressions in UI forms (webhooks rule editor, invite-team role descriptions).
Literal `t()` calls on actual UI screens have **100% Spanish coverage (0 missing)**.
Regarding dictionary size: `DICIONARIO` has 7,333 entries vs 5,570 AST-scanned keys in code; the difference (~1,763 entries) represents strings reached dynamically from tables/enums, backend services, or retained historical keys.

### Upstream context (important)

Upstream issue **melgarafael/DeskcommCRM#755** ("English as first-class language") has a
maintainer decision (2026-09-16) and an architecture design:

1. Translating never fails the PR of someone who didn't translate (missing → Portuguese).
2. Not translating never goes unnoticed (it is measured).
3. Each language declares a level: `em_construcao` (hidden, fails nothing) →
   `telas_principais` (visible; gaps in core screens fail) → `completo` (any gap fails).
4. One flat JSON catalog per language: `lib/i18n/traducoes/<code>.json`.
5. Language appears in selector/installer only when the registry level allows it.
6. Open point raised there: number/money format must also come from the registry.

Upstream said English lands in their "8th slice". **Before Phase 1, check whether upstream
already shipped the loader / level-aware gate** — if yes, merge `upstream/main` and skip
what exists:

```bash
git fetch upstream && git log --oneline main..upstream/main | grep -iE 'i18n|idioma|tradu|catalog|english|ingl'
gh issue view 755 -R melgarafael/DeskcommCRM --comments | tail -60
```

---

## 1. Decisions (confirmed by owner unless marked ⚠️)

- **D1 — Follow the upstream architecture, don't fork it.** Portuguese stays the *key*
  language in source; English is a catalog `lib/i18n/traducoes/en.json`. Rewriting source
  strings into English would conflict with every upstream merge forever. Rejected.
- **D2 — English is the default only by configuration on this fork**: bootstrap
  `APP_LOCALE=en`, `organizations.locale='en'`, Accept-Language `en` → `en`.
  ⚠️ Whether to also flip `IDIOMA_PADRAO` to `en` (the fallback for *unknown* locale)
  is a one-line fork-only diff — ask the owner at Phase 6.
- **D3 — Foundation pieces should be upstream-friendly** (registry entry, JSON loader,
  level-aware gate, number format from registry). Owner decides whether to PR them to
  upstream #755; if so, use the `deskcomm-contribuir` skill first.
- **D4 — Customer-facing messages (sent to leads over WhatsApp/e-mail) follow the lead's
  language, then the organization's** (`contacts.locale ?? organizations.locale`, the rule
  already used by `meet-delivery.ts`) — never the viewer's UI locale.
- **D6 — Language ≠ country.** UI language is `lib/i18n/registro.ts`; law, ID document, PII
  patterns and business-day calendar are `lib/legal/perfil-do-pais.ts`. An English UI does not
  make the org non-Brazilian; a Bangladesh org needs a `BD` country profile (Phase 7b).
- **D5 — Next language after English is likely Bangla (`bn`).** Any Bangla text MUST go
  through the `bangla-copy` skill (global rule in `~/.claude/CLAUDE.md`).

---

## 2. Phases

Each phase = its own branch off fresh `main` (`git fetch origin upstream && git merge upstream/main`
first — repo doctrine "Higiene de branches"), its own commits, green gates, merge to fork `main`.

### Phase 0 — Prep & inventory (read-only, ~1 session)

- [x] Sync: `git merge upstream/main` into `main`, push to `origin`.
- [x] Run the upstream check in §0. Update §0 table with fresh numbers.
- [x] Read fully: `lib/i18n/*.ts`, `lib/i18n/IdiomaProvider.tsx`,
      `tests/unit/i18n-*.test.ts`, `scripts/selar-traducao.ts`, `components/shell/SeletorDeIdioma.tsx`,
      `app/app/settings/profile/_form.tsx`, `app/app/settings/tenant/_form.tsx`.
- [x] Write `scripts/i18n-inventario.ts` (or reuse the gate's AST walker) that prints: total
      distinct `t()` keys, keys in `DICIONARIO`, keys per screen/route group. Output to
      `docs/i18n/inventory-en.md`.
- [x] Inventory the non-dictionary surfaces listed in §0 with counts per file.

**Exit:** inventory doc committed; numbers in this plan refreshed.

### Phase 1 — Foundation: `en` exists but is hidden

- [x] Add `en` to `REGISTRO_DE_IDIOMAS`: `nomeNativo: "English"`, `rotuloCurto: "EN"`,
      `tagBcp47: "en-US"`, `subtagsDoNavegador: ["en"]`, `nivel: "em_construcao"`.
- [x] JSON catalog loader: `traduzir()` resolves `DICIONARIO[text]?.[lang]` → `catalog[lang][text]`
      → `text`. Loads `lib/i18n/traducoes/<code>.json` via official loader `lib/i18n/catalogos.ts`.
      Verified client bundle impact with `pnpm build` (Next 16 Turbopack).
- [x] Types: `Traducoes` allows `en` without forcing entries (already `Partial`).
- [x] Level-aware gate: `i18n-espanhol-cobre-a-tela` stays blocking for `completo` languages;
      for `em_construcao` it only **reports** coverage. Parameterized over `REGISTRO_DE_IDIOMAS`.
- [x] `LOCALE_DE_DATA` gets `en` → `enUS` from `date-fns/locale`.
- [x] Empty `lib/i18n/traducoes/en.json` (`{}`).

**Verify:** `pnpm typecheck && pnpm lint && pnpm test:unit` (full suite, log protocol from
CLAUDE.md "Testes"), `pnpm build`. UI unchanged in pt-BR/es.

### Phase 2 — Numbers & money follow the language

- [ ] Add `formatarNumero` / `formatarMoeda` in `lib/i18n/` (or extend `lib/money.ts`) taking
      `Idioma` and using the registry `tagBcp47`.
- [ ] Replace the ~38 hard-coded `"pt-BR"` number formatters. Add a unit gate that forbids
      `toLocaleString("pt-BR"` / `NumberFormat("pt-BR"` outside the i18n layer (mirror
      `i18n-a-data-segue-o-idioma.test.ts`).
- [ ] Currency stays per org (`_cents` + ISO currency) — only the *formatting* changes.

### Phase 3 — Translation tooling

- [ ] `pnpm i18n:faltando en` → JSON of missing keys, each with pt + es reference, grouped by
      screen, in batches of ~200.
- [ ] `pnpm i18n:aplicar en <batch.json>` → merges into `en.json`, rejects empty values,
      duplicates, and keys that no longer exist; keeps file sorted for clean diffs.
- [ ] `pnpm i18n:cobertura` → % per language and **per screen** (upstream asked for per-screen,
      not per-key: "Inbox is in Portuguese" matters more than "92%").
- [ ] Glossary `docs/i18n/glossary-en.md`: fixed terms (lead, deal, pipeline, stage, handoff,
      inbox, agent/attendant, follow-up, won/lost, tenant=organization, "Central"…). Every
      translator agent reads it first. Placeholders (`{nome}`, `%s`) and ICU plurals must survive.

### Phase 4 — Translate UI in waves (parallelizable with subagents)

Order = first impression first (repo QA doctrine, P0):

1. Login, signup, invite accept, onboarding wizard, shell/nav (`lib/navigation/catalogo.ts`), 503/errors.
2. Inbox / conversations.
3. CRM: pipelines, leads, kanban, lead dossier, contacts.
4. Settings (profile, tenant, security/MFA, channels/WhatsApp, branding, team).
5. AI: agents, routers, follow-ups, knowledge base, prompt tester.
6. Agenda, performance/metrics, radar, quick replies, admin, LGPD, everything else.

Per wave:
- [ ] Generate batch → translator subagent(s) (one batch each, glossary + pt + es reference)
      → apply → a separate reviewer subagent spot-checks meaning, placeholders, tone.
- [ ] Temporarily set local org to `en` (see §4) and prove the screens **through the browser**
      (Playwright, screenshots in `.superpowers/evidence/`). Look for leftover Portuguese,
      overflowing labels (English is shorter, but German-style long labels won't apply).
- [ ] Commit per wave. Update Progress log.

### Phase 5 — Non-dictionary surfaces

- [ ] API error messages (`lib/api/errors.ts`) — returned `message` localized by caller locale;
      `code` never changes.
- [ ] E-mail templates (`lib/email/templates/`) — use the recipient org's locale via `marcaDaSaida()` flow.
- [ ] Notifications, Central/inbox items, cron-generated texts.
- [ ] AI: system prompt scaffolding and default agent templates in English when org locale is
      `en` (`lib/ai/render-system-prompt.ts`, niche templates). Don't translate a customer's own prompt.
- [ ] Messages auto-sent to leads (opt-out confirmation, handoff notice, reminders) → org locale.
- [ ] **Opt-out detection:** add English vocabulary (`STOP`, `unsubscribe`, "stop messaging me"…)
      to `lib/opt-out/deteccao.ts` with control phrases in `tests/unit/opt-out-deteccao.test.ts`
      — both levels (unambiguous / ambiguous), same rule used by ingestion and agent runtime.
      This is anti-ban critical; don't skip.
- [ ] Seed data in `supabase/baseline.sql` (default pipeline/stage names, vocabulary): localize
      at **creation time** by org locale, not by rewriting existing rows. Any schema/function change
      = migration + baseline appendix + MANIFEST (repo "Migrations & Banco" doctrine), and `pnpm test:db`.
- [ ] LGPD PDF: English version only if the owner wants it (it's a Brazilian legal document).

### Phase 6 — Promote English and make it the default

- [ ] Registry `en` → `nivel: "telas_principais"` (or `completo` once gates pass at 100%).
      The selector, profile and tenant forms derive from the registry automatically — verify.
- [ ] `scripts/bootstrap-owner.ts`: derive accepted locales from the registry; default `en` on the fork.
- [ ] `hostgator-setup-kit/install.sh` + `ubuntu-local-installer.sh`: add English option,
      default English on the fork; `pnpm test:shell`.
- [ ] ⚠️ Ask owner: flip `IDIOMA_PADRAO` to `en`?
- [ ] Full gates + e2e (`pnpm test:e2e`) with an English org; `vps-fresh-onboarding` flow in English.
- [ ] Release fragment in `.changes/` (`capacidade_nova`).

### Phase 7 — Multi-language (after English)

- [ ] Adding a language = registry entry (`em_construcao`) + `traducoes/<code>.json` + `LOCALE_DE_DATA`
      entry + glossary + opt-out vocabulary + waves from Phase 4.
- [ ] Bangla (`bn`): `tagBcp47: "bn-BD"`, Bengali digits decision ⚠️ (`bn-BD` formats with ০-৯ by
      default — decide per owner), `bangla-copy` skill mandatory for every string.

### Phase 7b — Country profile (only if orgs outside Brazil will run it)

- [ ] Add a profile to `PERFIS_DO_PAIS` in `lib/legal/perfil-do-pais.ts` (e.g. `BD`, `US`): ID
      document + validator, PII regex for the AI anonymizer, business-day calendar, law citation.
- [ ] Rule already enforced there: a country is only offered once its law citation is
      **reviewed** (`lei.revisada === true`); without it the privacy PDF cites no law. Don't invent one.
- [ ] Any schema touch = migration + baseline appendix + MANIFEST, and `pnpm test:db`.

---

## 3. How a session should run this (agent orchestration)

- One session = one phase (or one wave of Phase 4). Start by reading this file + Progress log.
- Main session orchestrates; use subagents for: inventory sweeps (`Explore`), translation batches
  (`general-purpose`, one batch each, in parallel), and review (`caveman:cavecrew-reviewer` or a
  fresh `general-purpose` reviewer that did **not** translate).
- Never let the translator verify its own batch.
- Keep batches ≤200 strings; JSON in, JSON out; the `i18n:aplicar` script is the only writer of `en.json`.
- Before declaring a phase done: full `pnpm test:unit` exit code + footer (CLAUDE.md "Testes"),
  `pnpm typecheck`, `pnpm lint`, and browser proof for UI phases.

## 4. Local environment for this work

Running dev setup (see conversation 2026-09-23): app `http://localhost:3128`, Supabase local
(`54321` API / `54322` DB / `54323` Studio), WAHA `127.0.0.1:4263`, SRH `127.0.0.1:6333`.
Login creds in `.env` (git-ignored). Ports come from `pmo ports list | grep DeskcommCRM`.

Switch the local org + admin to English (only meaningful once `en` exists in the registry):

```sql
update public.organizations set locale = 'en';
update auth.users set raw_user_meta_data = raw_user_meta_data || '{"locale":"en"}' where email = 'admin@admin.com';
```

(`psql postgresql://postgres:postgres@127.0.0.1:54322/postgres`; check `organizations.locale`
has no CHECK constraint rejecting `en` — none found on 2026-09-23.)

## 5. Progress log

| Date | Phase | Branch / PR | Result |
|---|---|---|---|
| 2026-09-23 | plan written | — | this file |
| 2026-09-23 | Phase 0 — Prep & inventory | feat/i18n-phase-0-inventory | Synced upstream/main@16a570096, measured 5,570 distinct UI keys, 7,333 dictionary entries, created scripts/i18n-inventario.ts and docs/i18n/inventory-en.md |
| 2026-09-23 | Phase 1 — Foundation: `en` hidden | feat/i18n-phase-1-foundation | Registered `en` (`em_construcao`), created `catalogos.ts` JSON loader, wired `traduzir()`, added `date-fns` locale, parameterized screen coverage gate over registry levels |
