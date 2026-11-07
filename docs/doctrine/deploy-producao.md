# Deploy em produção

> Movido verbatim de `CLAUDE.md` (HQ-213, 2026-11-07). Porta e regras duras: [`CLAUDE.md`](../../CLAUDE.md).

## Deploy em produção (NÃO NEGOCIÁVEL)

**Numa VPS que já tem proxy reverso próprio (Hostinger, Coolify, Dokploy…), todo
`up -d` leva os DOIS arquivos de compose:**

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.traefik.yml --env-file .env up -d app
```

Omitir `-f docker-compose.traefik.yml` recria o contêiner sem as labels de
roteamento; o Traefik da hospedagem deixa de enxergá-lo e **o domínio inteiro
responde `404 page not found`** — com o contêiner `healthy`, porque o
healthcheck é um probe TCP interno e não sabe nada de roteamento.

Depois de qualquer deploy, confirme que `/` responde **200** (a página inicial
pública) e `/app` responde **307** (redireciona pro login), e não 404. O 200
sozinho não prova que é o app: qualquer coisa no domínio responderia 200; o 307
de `/app` é o sinal específico. Verificações e o caso de build local em
`docs/runbooks/deploy.md`.

O caminho normal **não constrói nada na VPS**: commit → push → PR → merge na
`main` → o CI publica no GHCR → a VPS puxa. Imagem construída na VPS é exceção
de emergência e é dívida: existe só naquele disco e qualquer `up -d` sem
`APP_PULL_POLICY=never` a substitui em silêncio.

Essa frase já foi meia-verdade: valia para o `app` e era falsa para o produto,
porque o serviço `worker` não tinha `image:` — era construído na VPS de todo
cliente e nunca reconstruído por nenhum `update.sh`. Hoje os três serviços
nossos (`app`, `worker`, `scheduler`) são imagens publicadas, e um teste
reprova o retorno do padrão. Ver a doutrina abaixo.
