/**
 * Renders the system prompt for the bot agent.
 *
 * Templating uses `{{placeholder}}` style. Unknown placeholders survive
 * substitution unchanged so the operator can see what's missing in DevTools.
 *
 * Placeholders supported:
 *   {{vocabulary.lead}}  {{vocabulary.deal}}  {{vocabulary.won}}  {{vocabulary.lost}}
 *   {{contact_name}}     {{contact_locale}}
 *   {{recent_messages}}  {{retrieved_chunks}}
 */

import type { BotContext } from "@/lib/ai/types";
import type { Idioma } from "@/lib/i18n/idiomas";
import { nomeDoContato } from "@/lib/contacts/rotulo-do-contato";

const PLACEHOLDER_RX = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;

function asString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

function lookup(path: string, scope: Record<string, unknown>): unknown {
  const parts = path.split(".");
  let cursor: unknown = scope;
  for (const p of parts) {
    if (cursor === null || cursor === undefined) return undefined;
    if (typeof cursor !== "object") return undefined;
    cursor = (cursor as Record<string, unknown>)[p];
  }
  return cursor;
}

function formatRecentMessages(ctx: BotContext, en: boolean): string {
  if (!ctx.recent_messages.length) return en ? "(no history)" : "(sem histórico)";
  const lines = ctx.recent_messages.slice(-20).map((m) => {
    const role =
      m.direction === "inbound" ? (en ? "Customer" : "Cliente") : en ? "Agent" : "Atendente";
    const body = (m.body ?? "").trim().slice(0, 500);
    return `- [${role}] ${body}`;
  });
  return lines.join("\n");
}

function formatRetrievedChunks(ctx: BotContext, en: boolean): string {
  if (!ctx.retrieved_chunks.length) {
    return en
      ? "(no relevant passages in the knowledge base)"
      : "(sem trechos relevantes na base de conhecimento)";
  }
  return ctx.retrieved_chunks
    .map((c, i) => {
      const sim = (c.similarity * 100).toFixed(1);
      const body = c.content.trim().slice(0, 800);
      return en
        ? `### Passage #${i + 1} (similarity ${sim}%)\n${body}`
        : `### Trecho #${i + 1} (similaridade ${sim}%)\n${body}`;
    })
    .join("\n\n");
}

export function renderSystemPrompt(
  template: string,
  ctx: BotContext,
  idioma: Idioma | string = "pt-BR",
): string {
  const en = idioma === "en";
  const vocabulary = ((ctx.agent.config?.["vocabulary"] as Record<string, unknown> | undefined) ??
    (en
      ? { lead: "customer", deal: "order", won: "completed", lost: "canceled" }
      : { lead: "cliente", deal: "pedido", won: "concluído", lost: "cancelado" })) as Record<
    string,
    unknown
  >;

  const scope: Record<string, unknown> = {
    vocabulary,
    contact_name: nomeDoContato(ctx.contact) ?? (en ? "customer" : "cliente"),
    contact_locale: ctx.contact.locale ?? "pt-BR",
    recent_messages: formatRecentMessages(ctx, en),
    retrieved_chunks: formatRetrievedChunks(ctx, en),
  };

  const rendered = template.replace(PLACEHOLDER_RX, (match, key: string) => {
    const value = lookup(key, scope);
    if (value === undefined) return match; // leave the {{...}} marker so debug is obvious.
    return asString(value);
  });

  // Always append RAG block at the end so even un-templated prompts get context.
  if (!template.includes("{{retrieved_chunks}}") && ctx.retrieved_chunks.length) {
    const heading = en ? "Knowledge base" : "Base de conhecimento";
    return `${rendered}\n\n## ${heading}\n${formatRetrievedChunks(ctx, en)}`;
  }
  return rendered;
}
