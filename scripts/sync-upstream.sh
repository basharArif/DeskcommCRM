#!/usr/bin/env bash
# Brings upstream/main into `product` via the fork's `main` mirror. Merge only, never rebase or force.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

[ -z "$(git status --porcelain)" ] || { echo "working tree sujo: commite ou stash antes" >&2; exit 1; }
[ "$(git branch --show-current)" = "product" ] || { echo "rode a partir da branch product" >&2; exit 1; }

git fetch upstream
git fetch origin

git checkout main
git merge --ff-only upstream/main
git push origin main
git checkout product

git merge main || {
  echo "conflito: resolva (rerere lembra a resolução), depois 'git commit'" >&2
  echo "migration renumerada? rode: pnpm checar:colisao-de-migration" >&2
  exit 1
}

echo "--- migrations do fork vs upstream"
pnpm checar:colisao-de-migration || true
echo "--- cobertura de idiomas (strings novas do upstream sem tradução aparecem aqui)"
pnpm i18n:cobertura || true
echo "próximo: pnpm i18n:faltando en --gravar, pnpm typecheck, pnpm test:unit, git push origin product"
