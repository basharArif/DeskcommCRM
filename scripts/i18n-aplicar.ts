/**
 * I18N APLICAR — Valida e mescla lotes de tradução no catálogo lib/i18n/traducoes/<idioma>.json
 *
 * Uso:
 *   pnpm exec tsx scripts/i18n-aplicar.ts <idioma> <arquivo_ou_pasta.json>
 *   Ex: pnpm exec tsx scripts/i18n-aplicar.ts en docs/i18n/batches/en/onda1-lote1.json
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const IDIOMA = process.argv[2];
const ALVO = process.argv[3];

if (!IDIOMA || !ALVO) {
  console.error("Uso: pnpm exec tsx scripts/i18n-aplicar.ts <idioma> <arquivo_ou_pasta.json>");
  process.exit(1);
}

const catalogoPath = join(RAIZ, `lib/i18n/traducoes/${IDIOMA}.json`);
let catalogoAtual: Record<string, string> = {};
if (existsSync(catalogoPath)) {
  try {
    catalogoAtual = JSON.parse(readFileSync(catalogoPath, "utf8"));
  } catch {
    catalogoAtual = {};
  }
}

// Extrai placeholders de uma string (ex: {nome}, %s, %d, {{count}})
function extrairPlaceholders(texto: string): Set<string> {
  const achados = new Set<string>();
  const regex = /\{[a-zA-Z0-9_]+\}|%[sd]|\{\{[a-zA-Z0-9_]+\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(texto)) !== null) {
    achados.add(match[0]);
  }
  return achados;
}

// Encontra todos os arquivos JSON a processar
function coletarArquivos(caminho: string): string[] {
  if (!existsSync(caminho)) return [];
  const stat = statSync(caminho);
  if (stat.isFile()) return [caminho];
  if (stat.isDirectory()) {
    return readdirSync(caminho)
      .filter((f) => f.endsWith(".json"))
      .map((f) => join(caminho, f));
  }
  return [];
}

const arquivos = coletarArquivos(ALVO);
if (arquivos.length === 0) {
  console.error(`Nenhum arquivo JSON encontrado em: ${ALVO}`);
  process.exit(1);
}

interface ItemTraducao {
  chave: string;
  traducao: string;
}

let totalLidos = 0;
let aplicados = 0;
let ignoradosVazios = 0;
let errosDePlaceholder = 0;

for (const arq of arquivos) {
  let conteudo: unknown;
  try {
    conteudo = JSON.parse(readFileSync(arq, "utf8"));
  } catch (err) {
    console.error(`Erro ao ler JSON em ${arq}:`, err);
    continue;
  }

  const itens: ItemTraducao[] = [];
  if (Array.isArray(conteudo)) {
    for (const el of conteudo) {
      if (typeof el?.chave === "string" && typeof el?.traducao === "string") {
        itens.push({ chave: el.chave, traducao: el.traducao });
      }
    }
  } else if (conteudo && typeof conteudo === "object") {
    const obj = conteudo as Record<string, unknown>;
    if (Array.isArray(obj.itens)) {
      for (const el of obj.itens) {
        if (typeof el?.chave === "string" && typeof el?.traducao === "string") {
          itens.push({ chave: el.chave, traducao: el.traducao });
        }
      }
    } else {
      // Dicionário plano { [chave]: traducao }
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === "string") {
          itens.push({ chave: k, traducao: v });
        }
      }
    }
  }

  for (const item of itens) {
    totalLidos++;
    const chave = item.chave.trim();
    const traducao = item.traducao.trim();

    if (!traducao) {
      ignoradosVazios++;
      continue;
    }

    // Validação de placeholders
    const placeholdersChave = extrairPlaceholders(chave);
    const placeholdersTrad = extrairPlaceholders(traducao);
    let faltou = false;
    for (const ph of placeholdersChave) {
      if (!placeholdersTrad.has(ph)) {
        console.warn(`[Placeholder Ausente] Chave "${chave}" contém "${ph}" mas a tradução não: "${traducao}"`);
        faltou = true;
      }
    }
    if (faltou) {
      errosDePlaceholder++;
      continue;
    }

    catalogoAtual[chave] = traducao;
    aplicados++;
  }
}

// Ordena o catálogo alfabeticamente para diffs limpos e determinísticos
const catalogoOrdenado: Record<string, string> = {};
const chavesOrdenadas = Object.keys(catalogoAtual).sort((a, b) => a.localeCompare(b, "pt-BR"));
for (const k of chavesOrdenadas) {
  catalogoOrdenado[k] = catalogoAtual[k]!;
}

writeFileSync(catalogoPath, JSON.stringify(catalogoOrdenado, null, 2) + "\n", "utf8");

console.info(`\n=== Resultado de i18n-aplicar (${IDIOMA}) ===`);
console.info(`Arquivos processados: ${arquivos.length}`);
console.info(`Itens lidos: ${totalLidos}`);
console.info(`Aplicados com sucesso: ${aplicados}`);
console.info(`Ignorados por estarem vazios: ${ignoradosVazios}`);
console.info(`Rejeitados por erro de placeholder: ${errosDePlaceholder}`);
console.info(`Total de chaves no catálogo ${catalogoPath}: ${Object.keys(catalogoOrdenado).length}\n`);
