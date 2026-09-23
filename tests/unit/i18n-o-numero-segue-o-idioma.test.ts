import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

import ts from "typescript";
import { describe, expect, it } from "vitest";

import { formatarMoeda, formatarNumero } from "@/lib/i18n/numeros";

/**
 * O NÚMERO E O DINHEIRO SEGUEM O IDIOMA DE QUEM ESTÁ LENDO.
 *
 * Em português e espanhol, milhar usa ponto e decimal usa vírgula: 1.234,56.
 * Em inglês, milhar usa vírgula e decimal usa ponto: 1,234.56.
 *
 * Nenhuma tela de interface pode fixar "pt-BR" em toLocaleString ou Intl.NumberFormat.
 */

const RAIZ = join(__dirname, "..", "..");
const AREAS = ["app", "components", "hooks"];
const IGNORADAS = new Set(["node_modules", ".next"]);

const A_CAMADA_DE_NUMERO = new Set([
  "lib/i18n/numeros.ts",
  "lib/money.ts",
  "hooks/i18n/useFormatarNumero.ts",
]);

const FORA_DE_INTERFACE: Record<string, string> = {
  // Rotas de backend / mensagens de erro fixas em português
  "app/api/v1/ai/budget/route.ts": "mensagem de erro em pt-BR da rota de orçamento",
};

function arquivos(dir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORADAS.has(e.name) || e.name.startsWith(".")) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) arquivos(p, acc);
    else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function varrerNumerosNoAst(): string[] {
  const achados: string[] = [];
  for (const area of AREAS) {
    for (const arq of arquivos(join(RAIZ, area))) {
      const rel = relative(RAIZ, arq).split(sep).join("/");
      if (A_CAMADA_DE_NUMERO.has(rel) || rel in FORA_DE_INTERFACE) continue;
      const src = readFileSync(arq, "utf8");
      if (!src.includes('"pt-BR"') && !src.includes("'pt-BR'")) continue;
      const fonte = ts.createSourceFile(arq, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const visita = (no: ts.Node): void => {
        if (ts.isStringLiteral(no) && no.text === "pt-BR") {
          const pai = no.parent;
          let ehNumero = false;
          if (ts.isNewExpression(pai) && /NumberFormat$/.test(pai.expression.getText(fonte))) {
            ehNumero = true;
          } else if (ts.isCallExpression(pai) && ts.isPropertyAccessExpression(pai.expression)) {
            const metodo = pai.expression.name.text;
            if (metodo === "toLocaleString") {
              const receptor = pai.expression.expression.getText(fonte);
              // Não é data se parecer número ou valor
              if (!/\bDate\b/i.test(receptor) && !/(^|\.)(data|date|dia|quando|[\w]*_at|[\w]*At)$/i.test(receptor)) {
                ehNumero = true;
              }
            }
          }
          if (ehNumero) {
            const linha = fonte.getLineAndCharacterOfPosition(no.getStart()).line + 1;
            achados.push(`${rel}:${linha} → ${src.split("\n")[linha - 1]?.trim().slice(0, 90)}`);
          }
        }
        ts.forEachChild(no, visita);
      };
      visita(fonte);
    }
  }
  return achados;
}

describe("o número segue o idioma", () => {
  it("formatarNumero muda os separadores entre português e inglês", () => {
    const valor = 1234567.89;
    const pt = formatarNumero(valor, "pt-BR");
    const en = formatarNumero(valor, "en");

    expect(pt).toBe("1.234.567,89");
    expect(en).toBe("1,234,567.89");
  });

  it("formatarMoeda formata corretamente em USD para pt-BR e en", () => {
    const cents = 24990;
    const pt = formatarMoeda(cents, "USD", "pt-BR").replace(/[  ]/g, " ");
    const en = formatarMoeda(cents, "USD", "en").replace(/[  ]/g, " ");

    expect(pt).toContain("249,90");
    expect(en).toContain("249.90");
  });

  it("nenhum componente ou tela da interface formata número com 'pt-BR' fixo", () => {
    const vazando = varrerNumerosNoAst();
    expect(
      vazando,
      `${vazando.length} número(s) com o idioma fixo em "pt-BR". Use useTagDeIdioma() ou formatarNumero/formatarMoeda.\n${vazando.join("\n")}`,
    ).toEqual([]);
  });
});
