import { describe, expect, it } from "vitest";

import { renderSystemPrompt } from "@/lib/ai/render-system-prompt";
import type { BotContext } from "@/lib/ai/types";

const ctx = {
  agent: { config: {}, system_prompt: "" },
  contact: { id: "c", name: null, display_name: null, locale: null },
  recent_messages: [{ direction: "inbound", body: "oi" }],
  retrieved_chunks: [{ content: "x", similarity: 0.5 }],
} as unknown as BotContext;

describe("renderSystemPrompt por idioma", () => {
  it("sem idioma o andaime é o português de sempre", () => {
    const out = renderSystemPrompt("{{recent_messages}} {{vocabulary.lead}}", ctx);
    expect(out).toContain("[Cliente] oi");
    expect(out).toContain("## Base de conhecimento");
    expect(renderSystemPrompt("t", ctx, "es")).toBe(renderSystemPrompt("t", ctx));
  });

  it("en traduz o andaime e nunca o texto do cliente", () => {
    const out = renderSystemPrompt("Fale com o {{contact_name}}: {{recent_messages}}", ctx, "en");
    expect(out).toContain("Fale com o customer: - [Customer] oi");
    expect(out).toContain("## Knowledge base");
    expect(out).toContain("Passage #1 (similarity 50.0%)");
  });
});
