import { DICIONARIO } from "@/lib/i18n/dicionario";
import { NAV_CATALOG, NAV_GROUPS } from "@/lib/navigation/catalogo";
import {
  AREAS_DE_PRODUTO,
  varrerChavesDeI18n,
} from "@/tests/unit/helpers/chave-dinamica";

export function coletarChaves(): Map<string, string[]> {
  const chaves = new Map<string, string[]>();
  for (const [k, v] of varrerChavesDeI18n(AREAS_DE_PRODUTO).chaves) chaves.set(k, v);
  const menu: string[] = [];
  for (const item of NAV_CATALOG as readonly Record<string, unknown>[]) {
    for (const f of ["label", "description", "section"]) menu.push(String(item[f] ?? ""));
  }
  for (const g of NAV_GROUPS as unknown as readonly Record<string, unknown>[]) {
    for (const f of ["label", "description"]) menu.push(String(g[f] ?? ""));
  }
  for (const k of menu) {
    if (k.trim() !== "" && !chaves.has(k)) chaves.set(k, ["lib/navigation/catalogo.ts"]);
  }
  for (const k of Object.keys(DICIONARIO)) {
    if (!chaves.has(k)) chaves.set(k, ["lib/i18n/dicionario.ts"]);
  }
  return chaves;
}

export const NOMES_DE_ONDA: Record<number, string> = {
  0: "Compartilhado (UI/Dialogs)",
  1: "Onda 1: Auth, Onboarding & Shell",
  2: "Onda 2: Inbox & Conversas",
  3: "Onda 3: CRM, Pipelines & Contatos",
  4: "Onda 4: Configurações, Time & Canais",
  5: "Onda 5: IA, Agentes & RAG",
  6: "Onda 6: Agenda, Admin & Métricas",
};

const REGRAS_DE_ONDA: [number, string[]][] = [
  [1, ["/auth/", "/login", "/signup", "/convite", "/onboarding", "/shell/", "/navigation/"]],
  [2, ["/inbox/", "/conversas"]],
  [3, ["/crm/", "/kanban/", "/contacts/", "/leads/"]],
  [4, ["/settings/", "/team/", "/connections/", "/channels/"]],
  [5, ["/ai/", "/agent-engine/", "/mcp/"]],
  [6, ["/agenda/", "/voice/", "/metrics/", "/ads/", "/admin/", "/lgpd/"]],
];

export function classificarOnda(caminhos: string[]): number {
  for (const p of caminhos) {
    for (const [onda, trechos] of REGRAS_DE_ONDA) {
      if (trechos.some((t) => p.includes(t))) return onda;
    }
  }
  return 0;
}

// Tela = diretório da rota/componente, para o tradutor ter contexto.
export function telaDe(caminhos: string[]): string {
  const p = caminhos[0] ?? "";
  return p.split("/").slice(0, -1).join("/") || p;
}

export const REGEX_PLACEHOLDER = /\{\{[a-zA-Z0-9_]+\}\}|\{[a-zA-Z0-9_]+\}|%[sd]/g;
