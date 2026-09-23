/**
 * I18N FALTANDO — Identifica chaves não traduzidas e gera lotes de tradução.
 *
 * Uso:
 *   pnpm i18n:faltando [idioma] [--onda=N] [--gravar | --saida=<pasta>]
 *   Ex: pnpm exec tsx scripts/i18n-faltando.ts en --gravar
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";

import { DICIONARIO } from "@/lib/i18n/dicionario";
import { classificarOnda, coletarChaves, telaDe } from "./i18n-chaves";

const RAIZ = process.cwd();
const IDIOMA = process.argv[2]?.replace(/^--.*$/, "") || "en";
const TAMANHO_LOTE = 200;
const argSaida = process.argv.find((a) => a.startsWith("--saida="));
const DEVE_GRAVAR = process.argv.includes("--gravar") || Boolean(argSaida);

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

const varredura = { chaves: coletarChaves() };

export interface ItemFaltando {
  chave: string;
  es: string | null;
  onda: number;
  tela: string;
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
    tela: telaDe(locais),
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
  const saida = argSaida?.split("=")[1];
  const pastaBatches = saida
    ? isAbsolute(saida) ? saida : join(RAIZ, saida)
    : join(RAIZ, `docs/i18n/batches/${IDIOMA}`);
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
          pt: it.chave,
          es: it.es,
          tela: it.tela,
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
