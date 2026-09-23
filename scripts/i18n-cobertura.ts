/**
 * I18N COBERTURA — Mede a cobertura de tradução por idioma e por tela / onda.
 *
 * Uso:
 *   pnpm exec tsx scripts/i18n-cobertura.ts [idioma]
 *   Ex: pnpm exec tsx scripts/i18n-cobertura.ts en
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { DICIONARIO } from "@/lib/i18n/dicionario";
import { NAV_CATALOG, NAV_GROUPS } from "@/lib/navigation/catalogo";
import { REGISTRO_DE_IDIOMAS } from "@/lib/i18n/registro";
import {
  AREAS_DE_PRODUTO,
  varrerChavesDeI18n,
} from "@/tests/unit/helpers/chave-dinamica";

const RAIZ = process.cwd();
const IDIOMA_ALVO = process.argv[2] ?? null;

// 1. Carrega todos os catálogos JSON
const catalogosJson: Record<string, Record<string, string>> = {};
for (const reg of REGISTRO_DE_IDIOMAS) {
  const p = join(RAIZ, `lib/i18n/traducoes/${reg.codigo}.json`);
  if (existsSync(p)) {
    try {
      catalogosJson[reg.codigo] = JSON.parse(readFileSync(p, "utf8"));
    } catch {
      catalogosJson[reg.codigo] = {};
    }
  }
}

// 2. Coleta chaves de navegação
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

// 3. Executa varredura de AST
const varredura = varrerChavesDeI18n(AREAS_DE_PRODUTO);
for (const chave of chavesDoMenu) {
  if (!varredura.chaves.has(chave)) {
    varredura.chaves.set(chave, ["lib/navigation/catalogo.ts"]);
  }
}

// Classificador de onda por caminhos de arquivo
function classificarOnda(caminhos: string[]): { onda: number; nome: string } {
  for (const p of caminhos) {
    if (p.includes("/auth/") || p.includes("/login") || p.includes("/signup") || p.includes("/convite") || p.includes("/onboarding") || p.includes("/shell/") || p.includes("/navigation/")) {
      return { onda: 1, nome: "Onda 1: Auth, Onboarding & Shell" };
    }
    if (p.includes("/inbox/") || p.includes("/conversas")) {
      return { onda: 2, nome: "Onda 2: Inbox & Conversas" };
    }
    if (p.includes("/crm/") || p.includes("/kanban/") || p.includes("/contacts/") || p.includes("/leads/")) {
      return { onda: 3, nome: "Onda 3: CRM, Pipelines & Contatos" };
    }
    if (p.includes("/settings/") || p.includes("/team/") || p.includes("/connections/") || p.includes("/channels/")) {
      return { onda: 4, nome: "Onda 4: Configurações, Time & Canais" };
    }
    if (p.includes("/ai/") || p.includes("/agent-engine/") || p.includes("/mcp/")) {
      return { onda: 5, nome: "Onda 5: IA, Agentes & RAG" };
    }
    if (p.includes("/agenda/") || p.includes("/voice/") || p.includes("/metrics/") || p.includes("/ads/") || p.includes("/admin/") || p.includes("/lgpd/")) {
      return { onda: 6, nome: "Onda 6: Agenda, Admin & Métricas" };
    }
  }
  return { onda: 0, nome: "Compartilhado (UI/Dialogs)" };
}

// Checa se uma chave tem tradução para um idioma
function temTraducao(chave: string, idioma: string): boolean {
  if (idioma === "pt-BR") return true;
  const dic = (DICIONARIO as Record<string, Record<string, string>>)[chave];
  if (dic?.[idioma] && dic[idioma]?.trim() !== "") return true;
  const cat = catalogosJson[idioma];
  if (cat?.[chave] && cat[chave]?.trim() !== "") return true;
  return false;
}

const idiomasParaMedir = IDIOMA_ALVO
  ? [IDIOMA_ALVO]
  : REGISTRO_DE_IDIOMAS.map((r) => r.codigo).filter((c) => c !== "pt-BR");

const chavesArray = Array.from(varredura.chaves.entries());
const totalChaves = chavesArray.length;

console.info(`\n======================================================`);
console.info(`  RELATÓRIO DE COBERTURA I18N — ${totalChaves} chaves na interface`);
console.info(`======================================================\n`);

for (const idioma of idiomasParaMedir) {
  const reg = REGISTRO_DE_IDIOMAS.find((r) => r.codigo === idioma);
  const nivel = reg?.nivel ?? "desconhecido";

  console.info(`\n▶ Idioma: ${idioma} (${reg?.nomeNativo ?? idioma}) — Nível: [${nivel}]`);
  console.info(`----------------------------------------------------------------------`);
  console.info(`| Onda / Tela                                | Total  | Cob.   | %      |`);
  console.info(`|--------------------------------------------|--------|--------|--------|`);

  const porOndaStats: Record<number, { nome: string; total: number; cobertas: number }> = {};
  for (let o = 0; o <= 6; o++) {
    porOndaStats[o] = { nome: "", total: 0, cobertas: 0 };
  }

  let totalGeral = 0;
  let cobertasGeral = 0;

  for (const [chave, locais] of chavesArray) {
    const { onda, nome } = classificarOnda(locais);
    porOndaStats[onda]!.nome = nome;
    porOndaStats[onda]!.total++;
    totalGeral++;

    if (temTraducao(chave, idioma)) {
      porOndaStats[onda]!.cobertas++;
      cobertasGeral++;
    }
  }

  for (let o = 1; o <= 6; o++) {
    const st = porOndaStats[o]!;
    const pct = st.total > 0 ? ((st.cobertas / st.total) * 100).toFixed(1) : "100.0";
    console.info(`| ${st.nome.padEnd(42)} | ${String(st.total).padStart(6)} | ${String(st.cobertas).padStart(6)} | ${(pct + "%").padStart(6)} |`);
  }
  const st0 = porOndaStats[0]!;
  const pct0 = st0.total > 0 ? ((st0.cobertas / st0.total) * 100).toFixed(1) : "100.0";
  console.info(`| ${st0.nome.padEnd(42)} | ${String(st0.total).padStart(6)} | ${String(st0.cobertas).padStart(6)} | ${(pct0 + "%").padStart(6)} |`);
  console.info(`|--------------------------------------------|--------|--------|--------|`);

  const pctGeral = totalGeral > 0 ? ((cobertasGeral / totalGeral) * 100).toFixed(1) : "100.0";
  console.info(`| TOTAL GERAL                                | ${String(totalGeral).padStart(6)} | ${String(cobertasGeral).padStart(6)} | ${(pctGeral + "%").padStart(6)} |`);
  console.info(`----------------------------------------------------------------------\n`);
}
