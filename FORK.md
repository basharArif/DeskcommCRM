# FORK.md

Fork of `melgarafael/DeskcommCRM`. Goal: a separate product, English-first, then more languages, with its own UI and brand.

## Branches

| Branch | Role |
|---|---|
| `upstream/main` | Upstream truth. Read-only. |
| `main` | Mirror of `upstream/main`. Never commit here. |
| `product` | Our work. Default branch for all changes. |

## Syncing

```bash
bash scripts/sync-upstream.sh
```

Merge only. Never rebase or force-push `product`. `git rerere` is on, so a resolved conflict is remembered.

After each sync:
1. `pnpm i18n:cobertura`. Upstream edits to a Portuguese string leave our English key stale with no merge conflict.
2. `pnpm i18n:faltando en --gravar`, then translate.
3. `pnpm checar:colisao-de-migration`. Renumber ours if upstream took the number.
4. `pnpm typecheck && pnpm test:unit`, and `pnpm test:db` if schema changed.

## Deliberate divergences

Re-check each one after every sync.

| Area | Where | Notes |
|---|---|---|
| English default and catalog | `lib/i18n/traducoes/en.json`, `lib/i18n/dicionario.ts` | Portuguese text is the key, so upstream string edits go stale here. |
| Locale-aware money | `lib/money.ts`, `lib/i18n/numeros.ts` | Upstream `formatValorDoNegocio` kept. |
| Lead notices in English | `lib/escalacao/aviso-ao-lead.ts` | `TEXTOS` table gained an `en` entry. |
| Installer prompts | `hostgator-setup-kit/install.sh`, `_i18n.sh` | English prompt goes through `t()`. |
| Fast-check selector | `vitest.cercas.ts` | Follows relative `.json` imports as pure data so the i18n guard stays in `pnpm cercas`. |
| Org-language seeds | migration 0433, `baseline.sql` appendix | Sits before the anon sweep block. |

## Rules to keep conflicts small

- Brand and look go through `platform_branding` and the tokens in `app/globals.css`, not component edits.
- Generic improvements (i18n tooling, locale-aware formatting) go upstream as PRs.
- Our own migrations should use a distinct number range so they never collide with upstream's.

## Not yet done

- Own image publishing: `update.sh` and compose still pull upstream's GHCR images.
- `pnpm test:db` for migration 0433 and the e2e suite have not been run.
- License and naming review for the rebrand.
