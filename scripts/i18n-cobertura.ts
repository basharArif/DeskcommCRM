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
import { REGISTRO_DE_IDIOMAS } from "@/lib/i18n/registro";
import { classificarOnda, coletarChaves, NOMES_DE_ONDA, telaDe } from "./i18n-chaves";

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

const varredura = { chaves: coletarChaves() };

function classificar(caminhos: string[]): { onda: number; nome: string } {
  const onda = classificarOnda(caminhos);
  return { onda, nome: NOMES_DE_ONDA[onda]! };
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
    const { onda, nome } = classificar(locais);
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
  console.info(`----------------------------------------------------------------------`);

  const porTela = new Map<string, { total: number; cobertas: number }>();
  for (const [chave, locais] of chavesArray) {
    const t = porTela.get(telaDe(locais)) ?? { total: 0, cobertas: 0 };
    t.total++;
    if (temTraducao(chave, idioma)) t.cobertas++;
    porTela.set(telaDe(locais), t);
  }
  const piores = [...porTela.entries()].sort((a, b) => b[1].total - b[1].cobertas - (a[1].total - a[1].cobertas)).slice(0, 15);
  console.info(`\n  Telas com mais chaves faltando (top 15 de ${porTela.size}):`);
  for (const [tela, st] of piores) {
    console.info(`  ${String(st.cobertas).padStart(4)}/${String(st.total).padEnd(4)} ${tela}`);
  }
  console.info("");
}
