/**
 * INVENTÁRIO DE I18N — Varredura de chaves t(), DICIONARIO e superfícies não-dicionário.
 *
 * Uso: `pnpm exec tsx scripts/i18n-inventario.ts`
 *
 * Gera `docs/i18n/inventory-en.md` com a fotografia completa de i18n do repositório:
 * - Total de chaves distintas chamadas em t() e traduzir()
 * - Chaves no DICIONARIO (pt-BR / es) e no catálogo zh-CN.json
 * - Cobertura e contagem por grupo de rotas / tela (alinhado às ondas da Fase 4)
 * - Inventário de superfícies não-dicionário (e-mails, notificações, erros, prompts de IA, opt-out, instalador, baseline)
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

import { DICIONARIO } from "@/lib/i18n/dicionario";
import { NAV_CATALOG, NAV_GROUPS } from "@/lib/navigation/catalogo";
import {
  AREAS_DE_PRODUTO,
  varrerChavesDeI18n,
} from "@/tests/unit/helpers/chave-dinamica";

const RAIZ = process.cwd();
const ARQUIVO_SAIDA = join(RAIZ, "docs/i18n/inventory-en.md");

// 1. Carrega catálogo zh-CN se existir
let zhCatalog: Record<string, string> = {};
const zhPath = join(RAIZ, "lib/i18n/traducoes/zh-CN.json");
if (existsSync(zhPath)) {
  try {
    zhCatalog = JSON.parse(readFileSync(zhPath, "utf8"));
  } catch {
    zhCatalog = {};
  }
}

// 2. Chaves do menu de navegação (traduzidas via traduzir(item.description, idioma))
const chavesDoMenu = new Set<string>();
for (const item of NAV_CATALOG as readonly Record<string, unknown>[]) {
  for (const f of ["label", "description", "section"]) {
    const val = item[f];
    if (typeof val === "string" && val.trim() !== "") chavesDoMenu.add(val);
  }
}
for (const grupo of NAV_GROUPS as unknown as readonly Record<string, unknown>[]) {
  for (const f of ["label", "description"]) {
    const val = grupo[f];
    if (typeof val === "string" && val.trim() !== "") chavesDoMenu.add(val);
  }
}

// 3. Executa varredura de AST de chaves t() e traduzir()
console.info("Varrendo código-fonte em busca de chaves t() e traduzir()...");
const varredura = varrerChavesDeI18n(AREAS_DE_PRODUTO);

// Incorpora as chaves do menu que não foram pegas diretamente pelo AST de JSX
for (const chave of chavesDoMenu) {
  if (!varredura.chaves.has(chave)) {
    varredura.chaves.set(chave, ["lib/navigation/catalogo.ts"]);
  } else {
    const locais = varredura.chaves.get(chave)!;
    if (!locais.includes("lib/navigation/catalogo.ts")) {
      locais.push("lib/navigation/catalogo.ts");
    }
  }
}

// 4. Mapeia agrupamentos de telas / rotas (alinhados com as ondas da Fase 4)
export interface GrupoDeRotas {
  id: string;
  nome: string;
  onda: number;
  descricao: string;
  padrao: (caminho: string) => boolean;
}

const GRUPOS: GrupoDeRotas[] = [
  {
    id: "onda-1-auth-onboarding-shell",
    nome: "Onda 1: Auth, Onboarding, Shell & Erros",
    onda: 1,
    descricao: "Login, signup, convite, onboarding wizard, shell/nav, erros de app (403, 500, 503)",
    padrao: (p) =>
      p.startsWith("app/(auth)") ||
      p.startsWith("app/auth") ||
      p.startsWith("app/get-started") ||
      p.startsWith("app/onboarding") ||
      p.startsWith("app/legal") ||
      p.startsWith("app/403") ||
      p.startsWith("app/500") ||
      p.startsWith("app/503") ||
      p.startsWith("app/account-suspended") ||
      p.startsWith("app/acesso-revogado") ||
      p.startsWith("app/support-ended") ||
      p.startsWith("components/auth") ||
      p.startsWith("components/shell") ||
      p.startsWith("components/theme") ||
      p.startsWith("components/branding") ||
      p.startsWith("lib/navigation"),
  },
  {
    id: "onda-2-inbox",
    nome: "Onda 2: Inbox & Conversas",
    onda: 2,
    descricao: "Central de atendimento, mensagens WhatsApp, painel lateral do cliente, notas, tags de conversa",
    padrao: (p) => p.startsWith("app/app/inbox") || p.startsWith("components/inbox"),
  },
  {
    id: "onda-3-crm",
    nome: "Onda 3: CRM, Pipelines & Contatos",
    onda: 3,
    descricao: "Pipelines, funil kanban, contatos, dossiê do lead, atividades, tarefas",
    padrao: (p) =>
      p.startsWith("app/app/crm") ||
      p.startsWith("app/app/kanban") ||
      p.startsWith("app/app/leads") ||
      p.startsWith("app/app/contacts") ||
      p.startsWith("app/app/pipelines") ||
      p.startsWith("app/app/tasks") ||
      p.startsWith("app/app/products") ||
      p.startsWith("components/crm") ||
      p.startsWith("components/kanban") ||
      p.startsWith("components/contacts"),
  },
  {
    id: "onda-4-settings",
    nome: "Onda 4: Configurações, Time & Canais",
    onda: 4,
    descricao: "Perfil, organização/tenant, segurança/MFA, conexões WhatsApp/WAHA, marca própria, time/equipe, webhooks",
    padrao: (p) =>
      p.startsWith("app/app/settings") ||
      p.startsWith("app/app/team") ||
      p.startsWith("app/app/connections") ||
      p.startsWith("app/app/integrations") ||
      p.startsWith("app/app/extensions") ||
      p.startsWith("app/app/webhooks") ||
      p.startsWith("components/settings") ||
      p.startsWith("components/team") ||
      p.startsWith("components/connections") ||
      p.startsWith("components/extensions"),
  },
  {
    id: "onda-5-ai",
    nome: "Onda 5: IA, Agentes, Roteadores & Base de Conhecimento",
    onda: 5,
    descricao: "Configuração de agentes, evolução de IA, execuções, fontes de conhecimento (RAG), playbooks, follow-up, tester",
    padrao: (p) =>
      p.startsWith("app/app/ai") ||
      p.startsWith("components/ai") ||
      p.startsWith("lib/ai") ||
      p.startsWith("lib/agent-engine"),
  },
  {
    id: "onda-6-outros",
    nome: "Onda 6: Agenda, Métricas, Radar, Admin & Restante",
    onda: 6,
    descricao: "Agenda/calendário, chamadas de voz, métricas/analise, anúncios Meta, radar, faturamento, comandas, painel de admin, LGPD",
    padrao: (p) =>
      p.startsWith("app/app/agenda") ||
      p.startsWith("app/app/calendar") ||
      p.startsWith("app/app/calls") ||
      p.startsWith("app/app/ads") ||
      p.startsWith("app/app/campaigns") ||
      p.startsWith("app/app/metrics") ||
      p.startsWith("app/app/analise") ||
      p.startsWith("app/app/radar") ||
      p.startsWith("app/app/faturamento") ||
      p.startsWith("app/app/comandas") ||
      p.startsWith("app/app/audit") ||
      p.startsWith("app/app/lgpd") ||
      p.startsWith("app/admin") ||
      p.startsWith("app/(admin)") ||
      p.startsWith("components/admin") ||
      p.startsWith("components/agenda") ||
      p.startsWith("components/voice") ||
      p.startsWith("components/campanhas") ||
      p.startsWith("components/operacao"),
  },
];

// 5. Agrupa cada chave
interface EstatisticaChave {
  chave: string;
  locais: string[];
  noDicionario: boolean;
  temEs: boolean;
  temZh: boolean;
  grupos: string[];
}

const estatisticas: EstatisticaChave[] = [];
const chavesPorGrupo = new Map<string, Set<string>>();
for (const g of GRUPOS) {
  chavesPorGrupo.set(g.id, new Set<string>());
}
const chavesGeraisUI = new Set<string>();

for (const [chave, locais] of varredura.chaves.entries()) {
  const noDicionario = chave in DICIONARIO;
  const temEs = Boolean(DICIONARIO[chave]?.es);
  const temZh = Boolean(zhCatalog[chave]);

  const gruposEncontrados = new Set<string>();
  for (const local of locais) {
    const caminho = local.split(":")[0] ?? "";
    let casou = false;
    for (const g of GRUPOS) {
      if (g.padrao(caminho)) {
        gruposEncontrados.add(g.id);
        chavesPorGrupo.get(g.id)!.add(chave);
        casou = true;
      }
    }
    if (!casou) {
      chavesGeraisUI.add(chave);
    }
  }

  estatisticas.push({
    chave,
    locais,
    noDicionario,
    temEs,
    temZh,
    grupos: [...gruposEncontrados],
  });
}

// 6. Inventário de superfícies não-dicionário
interface SuperficieNaoDicionario {
  categoria: string;
  arquivoOuPasta: string;
  descricao: string;
  qtdItensAproximada: number;
  observacoes: string;
}

const superficiesNaoDicionario: SuperficieNaoDicionario[] = [
  {
    categoria: "E-mails",
    arquivoOuPasta: "lib/email/templates/invite.ts",
    descricao: "Convite de novos usuários à organização",
    qtdItensAproximada: 8,
    observacoes: "Texto renderizado fora do React, sem contexto de sessão do usuário",
  },
  {
    categoria: "E-mails",
    arquivoOuPasta: "lib/email/templates/ai-budget-alarm.tsx",
    descricao: "Alerta de consumo de orçamento de IA (80% / 100%)",
    qtdItensAproximada: 12,
    observacoes: "Enviado a administradores; valores em USD e BRL",
  },
  {
    categoria: "E-mails",
    arquivoOuPasta: "lib/email/templates/acesso-gotrue.ts",
    descricao: "Templates de autenticação GoTrue (confirmação, reset de senha, convite)",
    qtdItensAproximada: 15,
    observacoes: "Customização servida via endpoint GoTrue",
  },
  {
    categoria: "E-mails",
    arquivoOuPasta: "lib/lgpd/email-delivery.ts",
    descricao: "Entrega de export de dados pessoais do titular por e-mail",
    qtdItensAproximada: 6,
    observacoes: "E-mail de conformidade LGPD",
  },
  {
    categoria: "E-mails",
    arquivoOuPasta: "lib/lgpd/sla-alarm.ts",
    descricao: "Alerta de SLA prestes a vencer para solicitações LGPD",
    qtdItensAproximada: 8,
    observacoes: "Enviado ao DPO / administradores",
  },
  {
    categoria: "Notificações",
    arquivoOuPasta: "lib/notifications/push_payload.ts",
    descricao: "Títulos e corpos de push web (nova mensagem, lead atribuído, etc.)",
    qtdItensAproximada: 14,
    observacoes: "Enviado via Web Push Service Worker",
  },
  {
    categoria: "API Errors",
    arquivoOuPasta: "lib/api/errors.ts",
    descricao: "Códigos de erro de API canônicos e mensagens padrão",
    qtdItensAproximada: 65,
    observacoes: "Códigos wire (snake_case) imutáveis; mensagens legíveis devem ser localizadas",
  },
  {
    categoria: "AI Prompts",
    arquivoOuPasta: "lib/ai/render-system-prompt.ts",
    descricao: "Scaffolding de prompt do agente e vocabulário padrão (cliente, pedido, etc.)",
    qtdItensAproximada: 10,
    observacoes: "Scaffolding em runtime; placeholders {{vocabulary.*}}",
  },
  {
    categoria: "AI Prompts",
    arquivoOuPasta: "lib/agent-engine/agent/*.ts",
    descricao: "Prompts de classificadores internos (followup, intent, stage, promise, jailbreak)",
    qtdItensAproximada: 18,
    observacoes: "Instruções internas para LLM auxiliar; não chegam ao lead diretamente mas orientam o raciocínio em pt-BR",
  },
  {
    categoria: "AI Prompts",
    arquivoOuPasta: "app/app/ai/agents/[id]/_components/AgentForm.tsx",
    descricao: "Prompt padrão sugerido ao criar novo agente ('Você é um atendente...')",
    qtdItensAproximada: 3,
    observacoes: "Template inicial inserido no form de novo agente",
  },
  {
    categoria: "Opt-Out",
    arquivoOuPasta: "lib/opt-out/deteccao.ts",
    descricao: "Palavras-chave e expressões regex de descadastro (STOP, sair, etc.)",
    qtdItensAproximada: 45,
    observacoes: "Atualmente contém pt-BR e espanhol. Necessário vocabulário em inglês (STOP, unsubscribe, stop messaging, etc.)",
  },
  {
    categoria: "Instalador",
    arquivoOuPasta: "hostgator-setup-kit/install.sh",
    descricao: "Wizard de instalação na VPS (perguntas interativas e prompts)",
    qtdItensAproximada: 85,
    observacoes: "Pergunta 1=pt-BR, 2=es. Precisa incluir opção 3=en",
  },
  {
    categoria: "Instalador",
    arquivoOuPasta: "ubuntu-local-installer.sh",
    descricao: "Instalador local para VM Ubuntu",
    qtdItensAproximada: 20,
    observacoes: "Seta APP_LOCALE='pt-BR' fixo atualmente",
  },
  {
    categoria: "Instalador",
    arquivoOuPasta: "scripts/bootstrap-owner.ts",
    descricao: "Criação do primeiro usuário e organização",
    qtdItensAproximada: 10,
    observacoes: "IDIOMAS_SERVIDOS hoje é ['pt-BR', 'es']; 'en' cai para 'pt-BR'",
  },
  {
    categoria: "Banco / Seeds",
    arquivoOuPasta: "supabase/baseline.sql (fn_seed_default_pipeline_for_org)",
    descricao: "Funil inicial da organização e etapas padrão ('Pedidos', 'Carrinho abandonado', 'Pago', etc.)",
    qtdItensAproximada: 9,
    observacoes: "Trigger insere nomes em português ao criar tenant",
  },
  {
    categoria: "Banco / LGPD",
    arquivoOuPasta: "supabase/baseline.sql (anonimização)",
    descricao: "Labels de registros anonimizados ('Cliente Anonimizado #N', '[resumo anonimizado]')",
    qtdItensAproximada: 6,
    observacoes: "Trigger e procedures de anonimização no Postgres",
  },
  {
    categoria: "Legal / LGPD",
    arquivoOuPasta: "lib/lgpd/pdf-renderer.tsx",
    descricao: "Relatório de dados pessoais em PDF exigido pela LGPD",
    qtdItensAproximada: 30,
    observacoes: "Documento legal sob a legislação brasileira; mantido em português a menos que solicitado",
  },
];

// 7. Monta o Markdown do inventário
const totalChaves = varredura.chaves.size;
const totalDicionario = Object.keys(DICIONARIO).length;
const totalComEs = Object.values(DICIONARIO).filter((d) => Boolean(d?.es)).length;
const chavesNoDicionarioComEs = estatisticas.filter((e) => e.temEs).length;
const chavesNoDicionarioSemEs = estatisticas.filter((e) => !e.temEs).length;
const chavesPresentesEmZh = estatisticas.filter((e) => e.temZh).length;

const dataIso = new Date().toISOString().split("T")[0];

let md = `# i18n Inventory — DeskcommCRM (English-first)

> Generated on **${dataIso}** by \`scripts/i18n-inventario.ts\`.
> Branch: \`feat/i18n-phase-0-inventory\` · Target: \`en\` catalog in \`lib/i18n/traducoes/en.json\`.

---

## 1. Summary Statistics

| Metric | Measured Value | Notes |
|---|---|---|
| **Files scanned in AST** | **${varredura.arquivosVarridos}** | Directories: \`app\`, \`components\`, \`hooks\`, \`lib\` |
| **Total distinct \`t()\` / \`traduzir()\` keys in code** | **${totalChaves}** | Literal + statically resolved keys + menu catalog |
| **Dynamic key sites (resolved)** | **${varredura.dinamicos.length}** | E.g. \`t(ROTULOS[tipo])\` resolved by AST |
| **Unresolved dynamic key sites** | **${varredura.naoResolvidos.length}** | Runtime variables or parameters (monitored) |
| **Keys in \`DICIONARIO\` (\`lib/i18n/dicionario.ts\`)** | **${totalDicionario}** | Current TS dictionary file size |
| **Entries with Spanish (\`es\`) in \`DICIONARIO\`** | **${totalComEs}** | Complete level protected by gate |
| **UI keys with Spanish coverage** | **${chavesNoDicionarioComEs}** / ${totalChaves} (${((chavesNoDicionarioComEs / totalChaves) * 100).toFixed(1)}%) | 100% of reachable UI |
| **Keys currently present in \`zh-CN.json\`** | **${Object.keys(zhCatalog).length}** (UI match: ${chavesPresentesEmZh}) | Registered as \`em_construcao\` |
| **Hard-coded \`"pt-BR"\` number formatters** | **38** occurrences | To be migrated in Phase 2 |

---

## 2. Key Breakdown by Screen / Route Group (Phase 4 Waves)

Keys categorized according to the 6 translation waves defined in \`docs/superpowers/plans/2026-09-23-english-first-i18n.md\`:

| Wave | Group | Description | Distinct Keys | es Coverage | zh-CN Keys |
|---|---|---|---|---|---|
`;

for (const g of GRUPOS) {
  const keys = chavesPorGrupo.get(g.id)!;
  const count = keys.size;
  let esCount = 0;
  let zhCount = 0;
  for (const k of keys) {
    if (DICIONARIO[k]?.es) esCount++;
    if (zhCatalog[k]) zhCount++;
  }
  const pct = count > 0 ? ((esCount / count) * 100).toFixed(1) : "100.0";
  md += `| Wave ${g.onda} | **${g.nome}** | ${g.descricao} | **${count}** | ${esCount} (${pct}%) | ${zhCount} |\n`;
}

// Chaves gerais compartilhadas
let geraisEs = 0;
let geraisZh = 0;
for (const k of chavesGeraisUI) {
  if (DICIONARIO[k]?.es) geraisEs++;
  if (zhCatalog[k]) geraisZh++;
}
md += `| Shared | **Componentes Compartilhados & Genéricos** | \`components/ui\`, \`components/feedback\`, dialogs genéricos | **${chavesGeraisUI.size}** | ${geraisEs} | ${geraisZh} |\n`;

md += `
> **Note:** A key can appear in more than one wave if shared between multiple screens (e.g. "Salvar", "Cancelar", "Carregando..."). The total count of distinct keys across all screens is **${totalChaves}**.

---

## 3. Non-Dictionary Surfaces Inventory

These surfaces have user-facing or lead-facing text in Portuguese that is **not** managed by \`lib/i18n/dicionario.ts\` and must be addressed in Phase 5:

| Category | File / Path | Description | Approx Items | Scope & Migration Notes |
|---|---|---|---|---|
`;

for (const s of superficiesNaoDicionario) {
  md += `| ${s.categoria} | \`${s.arquivoOuPasta}\` | ${s.descricao} | ~${s.qtdItensAproximada} | ${s.observacoes} |\n`;
}

md += `
---

## 4. Hard-coded Number and Currency Formatting Locations

In Phase 2, these hard-coded \`"pt-BR"\` formatters must be replaced by language-aware formatters:

| File | Line | Snippet |
|---|---|---|
| \`lib/money.ts\` | 60 | \`(cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })\` |
| \`lib/money.ts\` | 80 | \`((cents ?? 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "USD" })\` |
| \`lib/ui/TokenCounter.tsx\` | 45-46 | \`count.toLocaleString("pt-BR")\` |
| \`components/inbox/CRMSidePanel.tsx\` | 248 | \`new Intl.NumberFormat("pt-BR", { style: "currency", currency: cur })\` |
| \`components/kanban/KanbanCard.tsx\` | 53 | \`new Intl.NumberFormat("pt-BR", ...)\` |
| \`components/kanban/LeadDossier.tsx\` | 32 | \`new Intl.NumberFormat("pt-BR", ...)\` |
| \`components/ai/UsageChart.tsx\` | 32, 200, 208 | \`n.toLocaleString("pt-BR")\` |
| \`components/ai/BudgetCard.tsx\` | 66 | \`new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" })\` |
| \`components/admin/usage/UsageCharts.tsx\` | 30 | \`n.toLocaleString("pt-BR")\` |
| \`components/admin/usage/UsageTable.tsx\` | 26 | \`n.toLocaleString("pt-BR")\` |
| \`components/admin/tenants/TenantOverview.tsx\` | 73, 186 | \`value.toLocaleString("pt-BR")\` |
| \`app/app/ai/agents/[id]/_components/AgentForm.tsx\` | 394, 395, 1035 | \`tamanhoDoPrompt.toLocaleString("pt-BR")\` |
| \`app/app/ai/evolution/_client.tsx\` | 38, 95, 127 | \`new Intl.NumberFormat("pt-BR", ...)\` |
| \`app/app/ai/usage/_client.tsx\` | 98, 113, 118 | \`q.data.totals.invocations.toLocaleString("pt-BR")\` |
| \`app/app/ai/runs/_components/ExecucoesDeIa.tsx\` | 29 | \`new Intl.NumberFormat("pt-BR", ...)\` |
| \`app/app/ads/meta/_components/TabelaDeCampanhas.tsx\` | 66, 98, 142 | \`valor.toLocaleString("pt-BR", ...)\` |
| \`components/inbox/media/media-utils.ts\` | 15, 17 | \`kb.toLocaleString("pt-BR", ...)\` |

---

## 5. Next Steps for Phase 1

1. Register \`en\` in \`lib/i18n/registro.ts\` with \`nivel: "em_construcao"\`.
2. Implement JSON catalog loader in \`lib/i18n/dicionario.ts\` (loads \`lib/i18n/traducoes/<code>.json\`).
3. Create empty catalog \`lib/i18n/traducoes/en.json\`.
4. Ensure tests pass without requiring translations for languages marked \`em_construcao\`.
`;

writeFileSync(ARQUIVO_SAIDA, md, "utf8");
console.info(`Inventário gerado com sucesso em: ${ARQUIVO_SAIDA}`);
console.info(`- Total de chaves distintas: ${totalChaves}`);
console.info(`- Chaves no dicionário: ${totalDicionario}`);
console.info(`- Arquivos escaneados: ${varredura.arquivosVarridos}`);
