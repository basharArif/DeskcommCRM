/**
 * O CATÁLOGO DE MODELOS — a face do módulo.
 *
 * Quem consome (a tela, a rota de instalação, o teste) importa daqui e nunca do
 * arquivo do nicho: acrescentar um nicho novo é acrescentar uma lista a
 * `MODELOS_DE_FOLLOWUP`, sem tocar em nenhum consumidor.
 */
import { traduzir } from "@/lib/i18n/dicionario";
import type { FlowNode } from "@/lib/followup/graph-schema";
import { MODELOS_DE_CLINICA } from "./clinica";
import type { ModeloDeFollowup, NichoDeModelo } from "./tipos";

export type { ModeloDeFollowup, NichoDeModelo, EntradaDoModelo } from "./tipos";
export { toquesDoModelo, horizonteDoModeloMs, NICHOS_DE_MODELO } from "./tipos";

export const MODELOS_DE_FOLLOWUP: readonly ModeloDeFollowup[] = [...MODELOS_DE_CLINICA];

const PADRAO_DE_RESPOSTA_EN: Record<string, string> = { quero: "want", remarcar: "reschedule" };

function rotuloDaEsperaEn(rotulo: string): string {
  const m = /^Espera (\d+) (dias?|horas?)$/.exec(rotulo);
  if (!m) return rotulo;
  const [, n, un] = m;
  const unidade = un!.startsWith("dia") ? "day" : "hour";
  return `Wait ${n} ${unidade}${n === "1" ? "" : "s"}`;
}

function localizarNo(no: FlowNode, idioma: string): FlowNode {
  const t = (x: string) => traduzir(rotuloDaEsperaEn(x), idioma);
  const label = no.label ? t(no.label) : no.label;
  if (no.type === "action" && no.config.mode === "text") {
    return { ...no, label, config: { ...no.config, body: t(no.config.body) } };
  }
  if (no.type === "end" && no.config.note) {
    return { ...no, label, config: { ...no.config, note: t(no.config.note) } };
  }
  if (no.type === "match_reply") {
    const branches = no.config.branches.map((b) => ({
      ...b,
      label: t(b.label),
      pattern: PADRAO_DE_RESPOSTA_EN[b.pattern] ?? b.pattern,
    }));
    return { ...no, label, config: { ...no.config, branches } };
  }
  return { ...no, label };
}

/** O catálogo é escrito em pt-BR; o texto só muda na instalação, nunca num fluxo já gravado. */
export function localizarModelo(modelo: ModeloDeFollowup, idioma: string): ModeloDeFollowup {
  if (idioma !== "en") return modelo;
  const t = (x: string) => traduzir(x, idioma);
  return {
    ...modelo,
    nome: t(modelo.nome),
    jornada: t(`${modelo.jornada}@@jornada`),
    resumo: t(modelo.resumo),
    oQueDispara: t(modelo.oQueDispara),
    grafo: { ...modelo.grafo, nodes: modelo.grafo.nodes.map((n) => localizarNo(n, idioma)) },
  };
}

/** `undefined` — e não um erro — para a rota devolver 404 com a sua própria mensagem. */
export function modeloPorId(id: string, idioma: string = "pt-BR"): ModeloDeFollowup | undefined {
  const modelo = MODELOS_DE_FOLLOWUP.find((m) => m.id === id);
  return modelo ? localizarModelo(modelo, idioma) : undefined;
}

export function modelosDoNicho(nicho: NichoDeModelo): ModeloDeFollowup[] {
  return MODELOS_DE_FOLLOWUP.filter((m) => m.nicho === nicho);
}
