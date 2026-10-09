import { describe, expect, it } from "vitest";

import { idiomaDaRequisicao } from "@/lib/api/idioma";
import { respostaDeRecusa } from "@/lib/api/recusa";
import { ApiError } from "@/lib/api/types";
import { fail } from "@/lib/api/wrappers";

const PT = "Sem organização ativa.";

describe("fail() localizado", () => {
  it("traduz a message e preserva code, status e details", async () => {
    const res = fail("forbidden_tenant", PT, 403, { locale: "en", details: { a: 1 } });
    const body = await res.json();
    expect(res.status).toBe(403);
    expect(body.error).toEqual({
      code: "forbidden_tenant",
      message: "No active organization.",
      details: { a: 1 },
    });
  });

  it("sem locale devolve o texto original", async () => {
    const body = await fail("forbidden_tenant", PT, 403).json();
    expect(body.error.message).toBe(PT);
  });

  it("texto sem tradução e locale pt-BR ficam intactos", async () => {
    expect((await fail("x", "Texto inédito", 400, { locale: "en" }).json()).error.message).toBe("Texto inédito");
    expect((await fail("x", PT, 403, { locale: "pt-BR" }).json()).error.message).toBe(PT);
  });

  it("respostaDeRecusa repassa o locale", async () => {
    const res = respostaDeRecusa(new ApiError(403, "forbidden_tenant", undefined, "r", PT), "r", "en");
    expect((await res.json()).error.message).toBe("No active organization.");
  });
});

describe("idiomaDaRequisicao", () => {
  it("lê Accept-Language; ausente é null", () => {
    expect(idiomaDaRequisicao(new Request("http://x", { headers: { "accept-language": "pt-BR,pt;q=0.9" } }))).toBe("pt-BR");
    expect(idiomaDaRequisicao(new Request("http://x"))).toBeNull();
  });
});
