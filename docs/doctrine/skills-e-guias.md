# Skills e guias relevantes (Claude Code)

> Movido verbatim de `CLAUDE.md` (HQ-213, 2026-11-07); só os links relativos foram ajustados ao novo local. Porta e regras duras: [`CLAUDE.md`](../../CLAUDE.md).

## Skills relevantes a usar (Claude Code)

**Guias embutidos neste repositório** (`.claude/skills/`, espelho gerado de `.agents/skills/` — a
mesma tabela vale para Codex, Cursor, OpenCode e Antigravity; ver `AGENTS.md`). Para tê-los em
qualquer pasta, `bash scripts/instalar-guias.sh`; editando um guia numa branch, rode com `--fonte .`
naquele clone — no Claude Code a skill GLOBAL vence a do projeto com o mesmo nome:

- `deskcomm-instalar` — instalar, atualizar ou consertar a instalação numa VPS
- `deskcomm-operacao` — usar o CRM no dia a dia, encontrar telas, fluxos e configurações pela interface
- `deskcomm-cliente-novo` — configurar o CRM para um cliente ou nicho (agentes, roteadores, follow-ups, conhecimento)
- `deskcomm-metricas` — desempenho, conversão, custo de IA, funil, relatório
- `deskcomm-prompt` — afinar o prompt de um agente que não performa
- `deskcomm-contribuir` — o espelho da triagem, antes do PR; fica quieto para o mantenedor
- `deskcomm-extensao` — criar extensão em vez de PR no núcleo: régua de destino, contrato do pacote e envio
- `deskcomm-doutrina` — as três regras que mais custam, antes de escrever código

Os guias têm página pública em [deskcomm.com.br/guias](https://www.deskcomm.com.br/guias), escrita
à mão em `deskcomm-site/conteudo/guias.ts`: guia criado, renomeado ou com comando novo pede a mesma
mudança lá — senão a página ensina um guia que não existe. Ela e a de changelog saem do mesmo PR do
`deskcomm-site`; enquanto as duas não responderem 200, vale o `curl` que abre a seção "A vitrine" de
[`docs/doctrine/versionamento.md`](versionamento.md), não a frase acima.

- `superpowers:brainstorming` — antes de implementar feature não-trivial
- `superpowers:writing-plans` — pra task com mais de 1 etapa de DB/API
- `superpowers:test-driven-development` — feature crítica (LGPD, RLS, anti-banimento)
- `superpowers:systematic-debugging` — bugs reportados
- `superpowers:verification-before-completion` — antes de declarar "pronto"
- `tomik-db-doctrine` — referência cruzada de doutrina de schema
- `supabase:supabase` — qualquer task com Supabase
- `vercel:nextjs` — App Router, Server Components, edge runtime
- `vercel:ai-gateway` — config de fallback de provider
- `frontend-design` — UI distinta (não cair em shadcn-default genérico)
