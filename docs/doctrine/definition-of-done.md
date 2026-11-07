# Definition of Done

> Movido verbatim de `CLAUDE.md` (HQ-213, 2026-11-07); só os links relativos foram ajustados ao novo local. Para contar os itens: `sed -n '/^## Definition of Done/,/^Um staff engineer/p' docs/doctrine/definition-of-done.md | grep -cE '^[0-9]+\. '`. Porta e regras duras: [`CLAUDE.md`](../../CLAUDE.md).

## Definition of Done

Antes de declarar uma task pronta:

1. `pnpm typecheck` passa zerado
2. `pnpm lint` zerado
3. Testes unit/e2e relevantes existem e passam
4. RLS testada se feature toca tabela tenant-aware
5. Audit log emitido se há mutação relevante
6. Rate limit aplicado se rota é pública
7. Zod valida todo input externo
8. Sem `console.log` esquecido
9. Env vars novas adicionadas em `.env.example` + `lib/env.ts`
10. Doc atualizada se mudou contrato (PRD/spec)
11. **Mudança de schema saiu como migration versionada (com `-- manifest:` no cabeçalho) + apêndice no baseline** (ver Doutrina de Migrations) — clones conseguem atualizar
12. **Se tocou UI/fluxo de usuário: provado pela tela como um leigo faria**, em ambiente fresco estilo VPS, com evidência visual (ver Doutrina de QA Visual com Recursos Reais) — curl não conta. Quando o caminho passa por um agente de IA, o caso de aceite mede o **par** (a tela pelo agente + a ferramenta chamada direto, com o mesmo texto cru) e só conta como prova quando os dois concordam — emenda em [`docs/doctrine/prova-em-par.md`](prova-em-par.md) (#489)
13. **Living System Checklist respondido** (lei em `docs/doctrine/sistema-vivo.md`; racional no manual `docs/doctrine/sistema-vivo/`) — a feature não é ilha: tem entrada + saída, emite atividade/log, aparece na tela, tem porta na navegação, tem mecanismo anti-morte, **declara seu laço de retorno** (invariante 7 — o que muda no sistema quando ela erra), e o mapa vivo (`docs/architecture/`) reflete peça nova com ≥2 arestas. Resposta que não **nomeia o artefato concreto** (consumidor real, tela real, log real) não conta
14. **Tela nova tem porta** — declarada em **`lib/navigation/catalogo.ts`** (no `NAV_CATALOG`, com seu grupo), ou na allowlist de `tests/unit/navegacao-completude.test.ts` **com justificativa escrita**. Ter tela e ser alcançável são coisas diferentes: o CI reprova tela que existe mas em que só se chega digitando a URL.

    ⚠️ Esta linha dizia `lib/navigation/registry.ts`, e quem a seguisse abria um
    arquivo **sem um único lugar onde declarar**: o `registry.ts` só deriva
    (`NAV_DESTINATIONS` sai de `NAV_CATALOG`) e reexporta. Ele é a FACE do
    módulo — é dele que o teste importa, e por isso o engano é fácil. Quem
    declara é o catálogo. Para conferir sem acreditar nesta linha:

    ```bash
    grep -c 'href:' lib/navigation/catalogo.ts lib/navigation/registry.ts
    ```
15. **Se tocou Dockerfile, compose ou setup kit: a mudança chega a quem já instalou** (lei em `docs/doctrine/packaging.md`) — nenhum serviço de produção ficou `build:`-only; variável nova tem default que não quebra `.env` antigo; a atualização não pede edição manual de arquivo; e, se mudou o que a imagem contém, o `update.sh` alcança essa peça. Rode `pnpm test:shell` — é o único gate que exercita o kit
16. **Se o PR muda comportamento, procure a afirmação de estado sobre esse comportamento.** Só
    sobre o que você mudou, e só nos documentos de autoridade — não saia caçando pelo repo. A
    documentação afirma como o mundo *está*, e uma auditoria de 2026-08-14 achou **227
    afirmações desatualizadas em 393 medidas**
    ([`docs/audits/2026-08-14-afirmacoes-de-estado.md`](../audits/2026-08-14-afirmacoes-de-estado.md)).
    Onde a afirmação puder virar **comando**, troque em vez de corrigir: um número corrigido
    envelhece de novo; um `rode isto para saber` não envelhece nunca

17. **Se o PR muda comportamento visível a quem opera uma VPS, ele traz o seu fragmento em
    `.changes/`** (lei em [`docs/doctrine/versionamento.md`](versionamento.md)).
    O fragmento declara **o efeito no operador** — `nada_mudou` / `capacidade_nova` /
    `exige_acao` —, nunca o número: o número é calculado a partir do conjunto, e é por isso
    que duas sessões paralelas não colidem mais. Confira com `pnpm release:conferir`.
    O CI valida a FORMA de todo fragmento, mas **não** cobra a presença de um — cobrar
    presença num check obrigatório reprovaria PR de Dependabot, PR de fork, e o próprio PR
    de release, que consome os fragmentos e deixa o diretório vazio. A presença é cobrada
    aqui, e por quem revisa.
    **Toda versão publicada aparece na página de changelog da LP** (deskcomm.com.br/changelog,
    pt-BR/en/es). Ninguém escreve no site: a LP lê o `CHANGELOG.md` da `main`, e o último passo
    do corte (`release.yml`, job `cortar-tag`) reprova quando a versão não chegou. O texto do
    fragmento é, portanto, nota pública. Enquanto as três páginas não responderem 200 esse passo
    reprova TODO corte — a vitrine vem de um PR do `deskcomm-site`, e o `curl` que diz em que
    estado ela está abre a seção. Lei: seção "A vitrine" de `versionamento.md`.

18. **Se o PR muda comportamento, ele declara o destino: núcleo, extensão, ambos ou
    infraestrutura** (lei em [`docs/doctrine/extensoes.md`](extensoes.md)), com a razão
    medida pela pergunta "se nenhuma organização ativar isto, a operação comum continua inteira?".
    "Ambos" traz o consumidor real do ponto novo do núcleo e a prova dos dois lados. Classificar como
    extensão não autoriza remover nem desligar o que já foi distribuído.

Um staff engineer aprovaria? Se não, itera.
