/**
 * I18N APLICAR — único escritor de lib/i18n/traducoes/<idioma>.json.
 * Valida lotes (chave existente, vazio, duplicata, placeholders, glossário) e mescla de forma idempotente.
 *
 * Uso: pnpm i18n:aplicar <idioma> <arquivo_ou_pasta.json>
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { coletarChaves, REGEX_PLACEHOLDER } from "./i18n-chaves";

const RAIZ = process.cwd();
const IDIOMA = process.argv[2];
const ALVO = process.argv[3];

if (!IDIOMA || !ALVO) {
  console.error("Uso: pnpm i18n:aplicar <idioma> <arquivo_ou_pasta.json>");
  process.exit(1);
}

const catalogoPath = join(RAIZ, `lib/i18n/traducoes/${IDIOMA}.json`);
if (!existsSync(catalogoPath)) {
  console.error(`Catálogo inexistente: ${catalogoPath}`);
  process.exit(1);
}
const textoOriginal = readFileSync(catalogoPath, "utf8");
const catalogo: Record<string, string> = JSON.parse(textoOriginal);

// Ordem importa: o ICU `{n, plural,` vira `{n}` antes da regex de placeholders simples.
function extrairPlaceholders(texto: string): Set<string> {
  const normalizado = texto.replace(/\{(\w+),\s*(?:plural|select|selectordinal)\b/g, "{$1}");
  return new Set(normalizado.match(REGEX_PLACEHOLDER) ?? []);
}

interface RegraGlossario {
  pt: RegExp;
  canonico: string[];
  proibidos: RegExp[];
}

// "negócio" como empresa do cliente (não deal do CRM) pode virar "business".
const NEGOCIO_COMO_EMPRESA = /seu negócio|tipo de negócio|negócio foi|meu negócio|vocabulário do negócio|para o negócio|sobre o negócio/i;

function carregarGlossario(): RegraGlossario[] {
  const p = join(RAIZ, "docs/i18n/glossary-en.md");
  if (!existsSync(p) || IDIOMA !== "en") return [];
  const regras: RegraGlossario[] = [];
  const limpar = (s: string) => s.replace(/\*\*/g, "").replace(/\([^)]*\)/g, "").trim();
  for (const linha of readFileSync(p, "utf8").split("\n")) {
    const c = linha.split("|").map((x) => x.trim());
    if (c.length < 5 || c[1]!.startsWith("---") || c[1] === "Portuguese Term") continue;
    const proibidos = limpar(c[3]!).split(/,|\/| or /).map((x) => x.trim()).filter((x) => x && x !== "—" && !x.includes("unless"));
    if (proibidos.length === 0) continue;
    const pts = limpar(c[1]!).split("/").map((x) => x.trim()).filter(Boolean);
    const canonico = limpar(c[2]!).split(/\/| or /).map((x) => x.trim().toLowerCase()).filter(Boolean);
    const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    regras.push({
      pt: new RegExp(`(^|[^\\p{L}])(${pts.map(esc).join("|")})($|[^\\p{L}])`, "iu"),
      canonico,
      proibidos: proibidos.map((x) => new RegExp(`(^|[^\\p{L}])${esc(x)}($|[^\\p{L}])`, "i")),
    });
  }
  return regras;
}

function coletarArquivos(caminho: string): string[] {
  if (!existsSync(caminho)) return [];
  if (statSync(caminho).isFile()) return [caminho];
  return readdirSync(caminho).filter((f) => f.endsWith(".json")).sort().map((f) => join(caminho, f));
}

const arquivos = coletarArquivos(ALVO);
if (arquivos.length === 0) {
  console.error(`Nenhum arquivo JSON encontrado em: ${ALVO}`);
  process.exit(1);
}

const chavesVivas = coletarChaves();
const glossario = carregarGlossario();

interface Item {
  chave: string;
  traducao: string;
}

function lerItens(conteudo: unknown): Item[] {
  const itens: Item[] = [];
  const empurra = (el: unknown) => {
    const o = el as { chave?: unknown; traducao?: unknown };
    if (typeof o?.chave === "string" && typeof o?.traducao === "string") {
      itens.push({ chave: o.chave, traducao: o.traducao });
    }
  };
  if (Array.isArray(conteudo)) conteudo.forEach(empurra);
  else if (conteudo && typeof conteudo === "object") {
    const obj = conteudo as Record<string, unknown>;
    if (Array.isArray(obj.itens)) obj.itens.forEach(empurra);
    else for (const [k, v] of Object.entries(obj)) if (typeof v === "string") itens.push({ chave: k, traducao: v });
  }
  return itens;
}

const stats = { lidos: 0, aplicados: 0, iguais: 0, vazios: 0, inexistentes: 0, duplicados: 0, placeholders: 0, glossario: 0 };
const vistos = new Map<string, string>();

for (const arq of arquivos) {
  let conteudo: unknown;
  try {
    conteudo = JSON.parse(readFileSync(arq, "utf8"));
  } catch (err) {
    console.error(`JSON inválido em ${arq}:`, err);
    process.exitCode = 1;
    continue;
  }
  for (const { chave, traducao: bruta } of lerItens(conteudo)) {
    stats.lidos++;
    const miolo = bruta.trim();
    if (!miolo) { stats.vazios++; continue; }
    // Chaves com espaço nas pontas são fragmentos concatenados na UI: o espaço tem de sobreviver.
    const traducao = (chave.match(/^\s*/)?.[0] ?? "") + miolo + (chave.match(/\s*$/)?.[0] ?? "");
    if (!chavesVivas.has(chave)) {
      console.warn(`[Chave inexistente] "${chave}"`);
      stats.inexistentes++;
      continue;
    }
    const anterior = vistos.get(chave);
    if (anterior !== undefined && anterior !== traducao) {
      console.warn(`[Duplicada com valor diferente] "${chave}": "${anterior}" vs "${traducao}"`);
      stats.duplicados++;
      continue;
    }
    vistos.set(chave, traducao);

    const esperados = extrairPlaceholders(chave);
    const recebidos = extrairPlaceholders(traducao);
    const diverge = [...esperados].some((p) => !recebidos.has(p)) || [...recebidos].some((p) => !esperados.has(p));
    if (diverge) {
      console.warn(`[Placeholders divergem] "${chave}" -> "${traducao}"`);
      stats.placeholders++;
      continue;
    }

    const violada = glossario.find(
      (r) => r.pt.test(chave) && !(r.canonico.includes("deal") && NEGOCIO_COMO_EMPRESA.test(chave)) && r.proibidos.some((x) => x.test(traducao)) && !r.canonico.some((c) => traducao.toLowerCase().includes(c)),
    );
    if (violada) {
      console.warn(`[Glossário] "${chave}" -> "${traducao}" usa termo proibido (esperado: ${violada.canonico.join(" / ")})`);
      stats.glossario++;
      continue;
    }

    if (catalogo[chave] === traducao) { stats.iguais++; continue; }
    catalogo[chave] = traducao;
    stats.aplicados++;
  }
}

const ordenado: Record<string, string> = {};
for (const k of Object.keys(catalogo).sort((a, b) => a.localeCompare(b, "pt-BR"))) ordenado[k] = catalogo[k]!;
const novoTexto = JSON.stringify(ordenado, null, 2) + "\n";
if (novoTexto !== textoOriginal) writeFileSync(catalogoPath, novoTexto, "utf8");

const rejeitados = stats.inexistentes + stats.duplicados + stats.placeholders + stats.glossario;
console.info(`\n=== i18n-aplicar (${IDIOMA}) ===`);
console.info(`arquivos=${arquivos.length} lidos=${stats.lidos} aplicados=${stats.aplicados} ja_iguais=${stats.iguais} vazios=${stats.vazios}`);
console.info(`rejeitados=${rejeitados} (inexistentes=${stats.inexistentes} duplicados=${stats.duplicados} placeholders=${stats.placeholders} glossario=${stats.glossario})`);
console.info(`total no catálogo: ${Object.keys(ordenado).length}`);
if (rejeitados > 0) process.exitCode = 1;
