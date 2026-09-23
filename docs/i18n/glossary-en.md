# Canonical Translation Glossary — DeskcommCRM (English)

> This document defines the canonical terminology for translating DeskcommCRM into English (`en`).
> All translation agents, contributors, and scripts must follow these terminology rules to maintain consistent, idiomatic, and professional UX.

---

## 1. Core Principles

1. **Natural Business English:** Avoid literal word-for-word Portuguese translations. Use standard SaaS and CRM terminology (e.g., "Deals", "Pipelines", "Stages", "Support", "Handoff").
2. **Preserve All Placeholders Intact:** Never alter or translate template variables:
   - `{nome}`, `{count}`, `{dias}`, `{minutos}`
   - `%s`, `%d`, `{0}`, `{1}`
   - `{{variable}}`
3. **Punctuation and Whitespace:**
   - Ellipses `...` or `…` must match source.
   - Colons `:`, questions `?`, and trailing periods must be preserved identically.
   - Leading or trailing spaces must be preserved exactly.
4. **Sentence Case for Buttons and Titles:** Follow modern UI conventions (e.g., "Save changes", "Create agent", "Cancel").

---

## 2. Canonical Terms Mapping

| Portuguese Term | Canonical English | Prohibited / Incorrect | Notes & Context |
|---|---|---|---|
| **Lead / Leads** | **Lead / Leads** | Prospect (unless specifically prospecting) | Keep as "Lead" |
| **Negócio / Oportunidade** | **Deal** | Business, Negotiation | Kanban cards and pipeline opportunities. Exception: "seu negócio", "tipo de negócio", "negócio foi", "meu negócio", "vocabulário do negócio", "para o negócio", "sobre o negócio" mean the customer's company -> "business" (allowed by `scripts/i18n-aplicar.ts`) |
| **Funil / Pipeline** | **Pipeline** | Funnel | Sales pipeline |
| **Etapa / Estágio** | **Stage** | Step, Phase | Stage within a pipeline |
| **Handoff** | **Handoff** | Transfer to human | Transition from AI bot to human agent |
| **Atendimento** | **Conversation** or **Support** | Attendance | "Atendimentos de IA" = "AI conversations" / "AI sessions" |
| **Atendente** | **Agent** (human) | Attendant | A human team member handling conversations |
| **Agente de IA** | **AI Agent** | AI Attendant, Robot | AI conversational agent |
| **Central / Central de avisos** | **Notification Center** | Notice Central | The alert and notification hub |
| **Central de atendimento** | **Inbox** | Attendance Central | The real-time chat interface |
| **Mensagem / Mensagens** | **Message / Messages** | — | Chat messages |
| **Follow-up** | **Follow-up** | Follow up (noun without hyphen) | Scheduled re-engagement |
| **Gasto de IA / Custo** | **AI cost** / **AI spend** | AI expense | LLM provider spend |
| **Orçamento** | **Budget** | Limit | Monthly LLM spend cap |
| **Teto** | **Limit** / **Cap** | Ceiling | Spend cap threshold |
| **Radar** | **Radar** | — | Deal radar / attention alerts |
| **Memória da IA** | **AI Memory** | AI Memorial | Long-term facts learned by the agent |
| **Base de conhecimento** | **Knowledge base** | Knowledge base | RAG documents and sources |
| **Regras do negócio** | **Business rules** | — | System guidelines |
| **Organização / Tenant** | **Organization** | Tenant (unless admin context) | The tenant company in the CRM |
| **Time / Equipe** | **Team** | Equipment | Workspace users |
| **Perfil** | **Profile** | — | User settings |
| **Marca própria** | **White-label** / **Branding** | Own brand | Custom logo and brand settings |
| **Conexão / Conexões** | **Connection / Connections** | — | WhatsApp/WAHA channel instances |
| **Instalação** | **Installation** | Setup | The self-hosted instance |
| **Ganho / Perdido** | **Won / Lost** | Gained / Missed | Deal outcomes |
| **Motivo de perda** | **Loss reason** | Reason of loss | Why a deal was lost |
| **Comanda** | **Order** | Command | E-commerce / retail ticket |
| **Roteador** | **Router** | — | Intent router between agents |
| **Playbook** | **Playbook** | — | Scripted conversation flow |
| **Dossiê do lead** | **Lead dossier** | Lead file | Side sheet showing lead history and fields |
| **Tags / Etiquetas** | **Tags** | Labels | Conversation and contact categorization |
| **Campos personalizados** | **Custom fields** | Customized fields | Org-defined fields |

---

## 3. Action Verbs & Common UI Labels

| Portuguese | English |
|---|---|
| Salvar | Save |
| Salvar alterações | Save changes |
| Cancelar | Cancel |
| Confirmar | Confirm |
| Excluir / Apagar | Delete |
| Editar | Edit |
| Criar | Create |
| Novo / Nova | New |
| Fechar | Close |
| Filtrar | Filter |
| Buscar / Pesquisar | Search |
| Carregando... | Loading... |
| Nenhum resultado encontrado | No results found |
| Voltar | Back |
| Próximo | Next |
| Concluir | Complete / Done |
| Devolver ao automático | Resume automation |
| Pausar IA | Pause AI |
| Enviar | Send |

---

## 4. Quality Rules for LLM Translators

1. **Context Matters:**
   - "Conta": can mean "Bill" (money), "Account" (user/Meta), or "Counts" (statistics). Inspect the surrounding text.
   - "Ponto": can mean "Dot", "Point", or "Router decision point".
2. **Tone:** Crisp, concise, professional, and friendly.
3. **No Machine Artifacts:** Do not translate variable names like `organization_id`, `api_key`, or HTTP error codes.
