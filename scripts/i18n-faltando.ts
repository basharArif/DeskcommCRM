/**
 * I18N FALTANDO — Identifica chaves não traduzidas e gera lotes de tradução.
 *
 * Uso:
 *   pnpm exec tsx scripts/i18n-faltando.ts [idioma] [--onda=N] [--gravar]
 *   Ex: pnpm exec tsx scripts/i18n-faltando.ts en --gravar
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { DICIONARIO } from "@/lib/i18n/dicionario";
import { NAV_CATALOG, NAV_GROUPS } from "@/lib/navigation/catalogo";
import {
  AREAS_DE_PRODUTO,
  varrerChavesDeI18n,
} from "@/tests/unit/helpers/chave-dinamica";

const RAIZ = process.cwd();
const IDIOMA = process.argv[2]?.replace(/^--.*$/, "") || "en";
const TAMANHO_LOTE = 200;
const DEVE_GRAVAR = process.argv.includes("--gravar");

const argOnda = process.argv.find((a) => a.startsWith("--onda="));
const FILTRO_ONDA = argOnda ? Number.parseInt(argOnda.split("=")[1] ?? "", 10) : null;

// 1. Carrega catálogo existente do idioma
let catalogoExistente: Record<string, string> = {};
const catalogoPath = join(RAIZ, `lib/i18n/traducoes/${IDIOMA}.json`);
if (existsSync(catalogoPath)) {
  try {
    catalogoExistente = JSON.parse(readFileSync(catalogoPath, "utf8"));
  } catch {
    catalogoExistente = {};
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

// 3. Executa varredura do AST
const varredura = varrerChavesDeI18n(AREAS_DE_PRODUTO);
for (const chave of chavesDoMenu) {
  if (!varredura.chaves.has(chave)) {
    varredura.chaves.set(chave, ["lib/navigation/catalogo.ts"]);
  }
}

// 4. Incorpora todas as chaves existentes do DICIONARIO
for (const chave of Object.keys(DICIONARIO)) {
  if (!varredura.chaves.has(chave)) {
    varredura.chaves.set(chave, ["lib/i18n/dicionario.ts"]);
  }
}

// 5. Classificador de onda por caminho de arquivo
function classificarOnda(caminhos: string[]): number {
  for (const p of caminhos) {
    if (p.includes("/auth/") || p.includes("/login") || p.includes("/signup") || p.includes("/convite") || p.includes("/onboarding") || p.includes("/shell/") || p.includes("/navigation/")) return 1;
    if (p.includes("/inbox/") || p.includes("/conversas")) return 2;
    if (p.includes("/crm/") || p.includes("/kanban/") || p.includes("/contacts/") || p.includes("/leads/")) return 3;
    if (p.includes("/settings/") || p.includes("/team/") || p.includes("/connections/") || p.includes("/channels/")) return 4;
    if (p.includes("/ai/") || p.includes("/agent-engine/") || p.includes("/mcp/")) return 5;
    if (p.includes("/agenda/") || p.includes("/voice/") || p.includes("/metrics/") || p.includes("/ads/") || p.includes("/admin/") || p.includes("/lgpd/")) return 6;
  }
  return 0; // Componentes compartilhados
}

export interface ItemFaltando {
  chave: string;
  es: string | null;
  onda: number;
  locais: string[];
}

const faltando: ItemFaltando[] = [];
for (const [chave, locais] of varredura.chaves.entries()) {
  if (chave.trim() === "") continue;
  // Se já está no catálogo do idioma ou no DICIONARIO para este idioma, pula
  if (catalogoExistente[chave] && catalogoExistente[chave]?.trim() !== "") continue;
  const dicEntry = (DICIONARIO as Record<string, Record<string, string>>)[chave];
  if (dicEntry?.[IDIOMA] && dicEntry[IDIOMA]?.trim() !== "") continue;

  const onda = classificarOnda(locais);
  if (FILTRO_ONDA !== null && onda !== FILTRO_ONDA) continue;

  faltando.push({
    chave,
    es: dicEntry?.es ?? null,
    onda,
    locais: locais.slice(0, 3),
  });
}

// Ordena por onda e alfabeticamente
faltando.sort((a, b) => {
  if (a.onda !== b.onda) return a.onda - b.onda;
  return a.chave.localeCompare(b.chave, "pt-BR");
});

console.info(`\n=== Chaves faltando para idioma '${IDIOMA}' ===`);
console.info(`Total faltando: ${faltando.length}\n`);

const porOnda: Record<number, ItemFaltando[]> = {};
for (const item of faltando) {
  porOnda[item.onda] = porOnda[item.onda] ?? [];
  porOnda[item.onda]!.push(item);
}

for (let o = 0; o <= 6; o++) {
  const itens = porOnda[o] ?? [];
  const rotulo = o === 0 ? "Compartilhado" : `Onda ${o}`;
  console.info(`- ${rotulo}: ${itens.length} chaves`);
}

// 6. Se --gravar, escreve lotes em docs/i18n/batches/<idioma>/
if (DEVE_GRAVAR) {
  const pastaBatches = join(RAIZ, `docs/i18n/batches/${IDIOMA}`);
  if (!existsSync(pastaBatches)) {
    mkdirSync(pastaBatches, { recursive: true });
  }

  for (const [ondaStr, itens] of Object.entries(porOnda)) {
    const ondaNum = Number.parseInt(ondaStr, 10);
    const prefixo = ondaNum === 0 ? "compartilhado" : `onda${ondaNum}`;
    let loteIndex = 1;
    for (let i = 0; i < itens.length; i += TAMANHO_LOTE) {
      const pedaco = itens.slice(i, i + TAMANHO_LOTE);
      const batchFile = join(pastaBatches, `${prefixo}-lote${loteIndex}.json`);
      const payload = {
        idioma: IDIOMA,
        onda: ondaNum,
        lote: loteIndex,
        total_no_lote: pedaco.length,
        itens: pedaco.map((it) => ({
          chave: it.chave,
          es: it.es,
          traducao: "", // Espaço para preenchimento
          locais: it.locais,
        })),
      };
      writeFileSync(batchFile, JSON.stringify(payload, null, 2) + "\n", "utf8");
      console.info(`Gravado lote: ${batchFile} (${pedaco.length} chaves)`);
      loteIndex++;
    }
  }
}
