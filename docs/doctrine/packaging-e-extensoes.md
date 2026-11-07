# Packaging e distribuição, e Extensões: as duas doutrinas não negociáveis

> Movido verbatim de `CLAUDE.md` (HQ-213, 2026-11-07); só os links relativos foram ajustados ao novo local. A lei completa está em [`packaging.md`](packaging.md) e [`extensoes.md`](extensoes.md). Porta e regras duras: [`CLAUDE.md`](../../CLAUDE.md).

## Packaging e distribuição — DOUTRINA (NÃO NEGOCIÁVEL)

Lei completa em [`docs/doctrine/packaging.md`](packaging.md);
decisões estruturais e o que foi recusado em
[`docs/adr/0001-packaging-e-distribuicao.md`](../adr/0001-packaging-e-distribuicao.md).
O não-negociável, em quatro linhas:

1. **Nenhum serviço de `docker-compose.prod.yml` constrói na máquina do
   cliente.** Todo serviço declara `image:` de uma imagem publicada; `build:`
   só existe **ao lado**, como escape. Serviço `build:`-only é invisível para
   `docker compose pull` e imune a `up -d` sem `--build` — ele não é só caro de
   instalar, ele **nunca é atualizado**.
2. **Publicação é ato do CI.** Nunca da sua máquina: o CI publica as imagens
   nativas para linux/amd64 e linux/arm64, e a falha de arquitetura precisa
   aparecer antes do `up -d` do cliente. O job
   `imagens-ok` reprova quando qualquer uma das três imagens não constrói, e
   **é status check obrigatório desde 2026-08-13** — a branch protection tem
   `verify, build-and-size, invariants, e2e, imagens-ok`. (Este parágrafo dizia
   "ainda não é obrigatório" até 2026-08-14; a ativação era o passo final do
   merge da doutrina e aconteceu.) Confira na fonte antes de confiar nesta linha.
3. **Instalação de cliente aponta para número de versão, nunca para tag móvel.**
   `latest` aqui significa **topo da `main`**, não última release — quem quer a
   última release usa `stable`. `pull_policy` acompanha a mutabilidade da tag:
   imutável → `missing`, móvel → `always`.
4. **Dependência upstream é referenciada com tag fixa, nunca republicada.**
   Vale para WAHA (licenciado — republicar é passivo jurídico), Redis, Caddy e
   `serverless-redis-http`.

Bump de versão **não pode** exigir que o operador da VPS edite `.env`, compose
ou qualquer arquivo à mão. Se exigir, não entra: vira issue com plano de
migração e vai para uma major.

## Extensões — DOUTRINA (NÃO NEGOCIÁVEL)

Lei completa em [`docs/doctrine/extensoes.md`](extensoes.md); o
contrato que existe hoje em
[`docs/specs/extensoes-declarativas-v1.md`](../specs/extensoes-declarativas-v1.md).
A pergunta que decide o destino de uma mudança não é "isto serve a muita gente?",
e sim **"se nenhuma organização ativar isto, a operação comum continua inteira?"**.
O não-negociável:

1. **O núcleo continua útil com zero extensões.** Identidade, autorização,
   isolamento, auditoria, contratos e cadeia de envio são núcleo; jornada de nicho,
   aparência e integração com dados e manutenção próprios podem ser extensão.
2. **Extensão pede capacidade nomeada; não importa código interno nem lê o banco.**
   Instalar não concede autoridade: toda escrita revalida ator, organização e papel
   atuais no banco.
3. **A instância decide o pacote; a organização decide o uso.** Instalar, atualizar,
   desfazer e remover são do administrador da instalação; ativar e configurar, do
   administrador da organização. A plataforma não reativa decisão da organização.
4. **Toda operação é recibo idempotente com saída pela tela, e toda troca de
   ponteiro exige a revisão que a tela viu.** Tirar é lógico e preserva dados.
5. **Não anunciar o que não existe** (SDK, código isolado, marketplace público), e
   não extrair do núcleo recurso já distribuído sem equivalência e migração.
6. **Módulo oficial com dados não põe tabela no baseline para todos**
   ([ADR-0002](../adr/0002-tabelas-de-modulo-num-banco-so.md), aceita em 17/09/2026). Um banco
   só, schema `public`; as tabelas nascem por função provisionadora fixa do módulo, quando ele é
   **instalado na instância**. Ninguém opera segundo banco — é decisão do dono, e seria impossível
   com chave estrangeira para o núcleo.
