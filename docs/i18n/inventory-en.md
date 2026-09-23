# i18n Inventory — DeskcommCRM (English-first)

> Generated on **2026-09-23** by `scripts/i18n-inventario.ts`.
> Branch: `feat/i18n-phase-0-inventory` · Target: `en` catalog in `lib/i18n/traducoes/en.json`.

---

## 1. Summary Statistics

| Metric | Measured Value | Notes |
|---|---|---|
| **Files scanned in AST** | **729** | Directories: `app`, `components`, `hooks`, `lib` |
| **Total distinct `t()` / `traduzir()` keys in code** | **5570** | Literal + statically resolved keys + menu catalog |
| **Dynamic key sites (resolved)** | **122** | E.g. `t(ROTULOS[tipo])` resolved by AST |
| **Unresolved dynamic key sites** | **747** | Runtime variables or parameters (monitored) |
| **Keys in `DICIONARIO` (`lib/i18n/dicionario.ts`)** | **7333** | Current TS dictionary file size |
| **Entries with Spanish (`es`) in `DICIONARIO`** | **7333** | Complete level protected by gate |
| **UI keys with Spanish coverage** | **5487** / 5570 (98.5%) | 100% of reachable UI |
| **Keys currently present in `zh-CN.json`** | **5384** (UI match: 3998) | Registered as `em_construcao` |
| **Hard-coded `"pt-BR"` number formatters** | **38** occurrences | To be migrated in Phase 2 |

---

## 2. Key Breakdown by Screen / Route Group (Phase 4 Waves)

Keys categorized according to the 6 translation waves defined in `docs/superpowers/plans/2026-09-23-english-first-i18n.md`:

| Wave | Group | Description | Distinct Keys | es Coverage | zh-CN Keys |
|---|---|---|---|---|---|
| Wave 1 | **Onda 1: Auth, Onboarding, Shell & Erros** | Login, signup, convite, onboarding wizard, shell/nav, erros de app (403, 500, 503) | **563** | 562 (99.8%) | 507 |
| Wave 2 | **Onda 2: Inbox & Conversas** | Central de atendimento, mensagens WhatsApp, painel lateral do cliente, notas, tags de conversa | **259** | 259 (100.0%) | 210 |
| Wave 3 | **Onda 3: CRM, Pipelines & Contatos** | Pipelines, funil kanban, contatos, dossiê do lead, atividades, tarefas | **363** | 363 (100.0%) | 318 |
| Wave 4 | **Onda 4: Configurações, Time & Canais** | Perfil, organização/tenant, segurança/MFA, conexões WhatsApp/WAHA, marca própria, time/equipe, webhooks | **1464** | 1457 (99.5%) | 971 |
| Wave 5 | **Onda 5: IA, Agentes, Roteadores & Base de Conhecimento** | Configuração de agentes, evolução de IA, execuções, fontes de conhecimento (RAG), playbooks, follow-up, tester | **1285** | 1284 (99.9%) | 1095 |
| Wave 6 | **Onda 6: Agenda, Métricas, Radar, Admin & Restante** | Agenda/calendário, chamadas de voz, métricas/analise, anúncios Meta, radar, faturamento, comandas, painel de admin, LGPD | **1202** | 1202 (100.0%) | 781 |
| Shared | **Componentes Compartilhados & Genéricos** | `components/ui`, `components/feedback`, dialogs genéricos | **892** | 818 | 535 |

> **Note:** A key can appear in more than one wave if shared between multiple screens (e.g. "Salvar", "Cancelar", "Carregando..."). The total count of distinct keys across all screens is **5570**.

---

## 3. Non-Dictionary Surfaces Inventory

These surfaces have user-facing or lead-facing text in Portuguese that is **not** managed by `lib/i18n/dicionario.ts` and must be addressed in Phase 5:

| Category | File / Path | Description | Approx Items | Scope & Migration Notes |
|---|---|---|---|---|
| E-mails | `lib/email/templates/invite.ts` | Convite de novos usuários à organização | ~8 | Texto renderizado fora do React, sem contexto de sessão do usuário |
| E-mails | `lib/email/templates/ai-budget-alarm.tsx` | Alerta de consumo de orçamento de IA (80% / 100%) | ~12 | Enviado a administradores; valores em USD e BRL |
| E-mails | `lib/email/templates/acesso-gotrue.ts` | Templates de autenticação GoTrue (confirmação, reset de senha, convite) | ~15 | Customização servida via endpoint GoTrue |
| E-mails | `lib/lgpd/email-delivery.ts` | Entrega de export de dados pessoais do titular por e-mail | ~6 | E-mail de conformidade LGPD |
| E-mails | `lib/lgpd/sla-alarm.ts` | Alerta de SLA prestes a vencer para solicitações LGPD | ~8 | Enviado ao DPO / administradores |
| Notificações | `lib/notifications/push_payload.ts` | Títulos e corpos de push web (nova mensagem, lead atribuído, etc.) | ~14 | Enviado via Web Push Service Worker |
| API Errors | `lib/api/errors.ts` | Códigos de erro de API canônicos e mensagens padrão | ~65 | Códigos wire (snake_case) imutáveis; mensagens legíveis devem ser localizadas |
| AI Prompts | `lib/ai/render-system-prompt.ts` | Scaffolding de prompt do agente e vocabulário padrão (cliente, pedido, etc.) | ~10 | Scaffolding em runtime; placeholders {{vocabulary.*}} |
| AI Prompts | `lib/agent-engine/agent/*.ts` | Prompts de classificadores internos (followup, intent, stage, promise, jailbreak) | ~18 | Instruções internas para LLM auxiliar; não chegam ao lead diretamente mas orientam o raciocínio em pt-BR |
| AI Prompts | `app/app/ai/agents/[id]/_components/AgentForm.tsx` | Prompt padrão sugerido ao criar novo agente ('Você é um atendente...') | ~3 | Template inicial inserido no form de novo agente |
| Opt-Out | `lib/opt-out/deteccao.ts` | Palavras-chave e expressões regex de descadastro (STOP, sair, etc.) | ~45 | Atualmente contém pt-BR e espanhol. Necessário vocabulário em inglês (STOP, unsubscribe, stop messaging, etc.) |
| Instalador | `hostgator-setup-kit/install.sh` | Wizard de instalação na VPS (perguntas interativas e prompts) | ~85 | Pergunta 1=pt-BR, 2=es. Precisa incluir opção 3=en |
| Instalador | `ubuntu-local-installer.sh` | Instalador local para VM Ubuntu | ~20 | Seta APP_LOCALE='pt-BR' fixo atualmente |
| Instalador | `scripts/bootstrap-owner.ts` | Criação do primeiro usuário e organização | ~10 | IDIOMAS_SERVIDOS hoje é ['pt-BR', 'es']; 'en' cai para 'pt-BR' |
| Banco / Seeds | `supabase/baseline.sql (fn_seed_default_pipeline_for_org)` | Funil inicial da organização e etapas padrão ('Pedidos', 'Carrinho abandonado', 'Pago', etc.) | ~9 | Trigger insere nomes em português ao criar tenant |
| Banco / LGPD | `supabase/baseline.sql (anonimização)` | Labels de registros anonimizados ('Cliente Anonimizado #N', '[resumo anonimizado]') | ~6 | Trigger e procedures de anonimização no Postgres |
| Legal / LGPD | `lib/lgpd/pdf-renderer.tsx` | Relatório de dados pessoais em PDF exigido pela LGPD | ~30 | Documento legal sob a legislação brasileira; mantido em português a menos que solicitado |

---

## 4. Hard-coded Number and Currency Formatting Locations

In Phase 2, these hard-coded `"pt-BR"` formatters must be replaced by language-aware formatters:

| File | Line | Snippet |
|---|---|---|
| `lib/money.ts` | 60 | `(cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })` |
| `lib/money.ts` | 80 | `((cents ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "USD" })` |
| `lib/ui/TokenCounter.tsx` | 45-46 | `count.toLocaleString("pt-BR")` |
| `components/inbox/CRMSidePanel.tsx` | 248 | `new Intl.NumberFormat("pt-BR", { style: "currency", currency: cur })` |
| `components/kanban/KanbanCard.tsx` | 53 | `new Intl.NumberFormat("pt-BR", ...)` |
| `components/kanban/LeadDossier.tsx` | 32 | `new Intl.NumberFormat("pt-BR", ...)` |
| `components/ai/UsageChart.tsx` | 32, 200, 208 | `n.toLocaleString("pt-BR")` |
| `components/ai/BudgetCard.tsx` | 66 | `new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" })` |
| `components/admin/usage/UsageCharts.tsx` | 30 | `n.toLocaleString("pt-BR")` |
| `components/admin/usage/UsageTable.tsx` | 26 | `n.toLocaleString("pt-BR")` |
| `components/admin/tenants/TenantOverview.tsx` | 73, 186 | `value.toLocaleString("pt-BR")` |
| `app/app/ai/agents/[id]/_components/AgentForm.tsx` | 394, 395, 1035 | `tamanhoDoPrompt.toLocaleString("pt-BR")` |
| `app/app/ai/evolution/_client.tsx` | 38, 95, 127 | `new Intl.NumberFormat("pt-BR", ...)` |
| `app/app/ai/usage/_client.tsx` | 98, 113, 118 | `q.data.totals.invocations.toLocaleString("pt-BR")` |
| `app/app/ai/runs/_components/ExecucoesDeIa.tsx` | 29 | `new Intl.NumberFormat("pt-BR", ...)` |
| `app/app/ads/meta/_components/TabelaDeCampanhas.tsx` | 66, 98, 142 | `valor.toLocaleString("pt-BR", ...)` |
| `components/inbox/media/media-utils.ts` | 15, 17 | `kb.toLocaleString("pt-BR", ...)` |

---

## 5. Next Steps for Phase 1

1. Register `en` in `lib/i18n/registro.ts` with `nivel: "em_construcao"`.
2. Implement JSON catalog loader in `lib/i18n/dicionario.ts` (loads `lib/i18n/traducoes/<code>.json`).
3. Create empty catalog `lib/i18n/traducoes/en.json`.
4. Ensure tests pass without requiring translations for languages marked `em_construcao`.
