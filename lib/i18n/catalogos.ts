/**
 * O LEITOR DE CATÁLOGOS DE IDIOMA — a porta única para arquivos em `lib/i18n/traducoes/`.
 *
 * ─── O problema que ele resolve ────────────────────────────────────────────
 *
 * O `dicionario.ts` centralizava todas as traduções num único arquivo TS de 11.6k+
 * linhas. Com JSON por idioma (`traducoes/<code>.json`), cada língua tem seu
 * catálogo plano, e novas línguas entram sem conflitos de merge.
 *
 * ─── Resolução em camadas ──────────────────────────────────────────────────
 *
 * `traduzir()` consulta primeiro `DICIONARIO[texto][idioma]`, depois este leitor
 * `buscarNoCatalogo(texto, idioma)`, e por fim degrada para o texto em português.
 */

import en from "./traducoes/en.json";
import zhCN from "./traducoes/zh-CN.json";

export const CATALOGOS: Record<string, Record<string, string>> = {
  en: en as Record<string, string>,
  "zh-CN": zhCN as Record<string, string>,
};

/**
 * Busca a tradução de um texto em um catálogo JSON de idioma.
 * Devolve `undefined` se a chave não estiver traduzida naquele idioma.
 */
export function buscarNoCatalogo(texto: string, idioma: string): string | undefined {
  return CATALOGOS[idioma]?.[texto];
}
