import { describe, expect, it } from "vitest";

import type { MarcaDeSaida } from "@/lib/branding/saida";
import { buildInviteEmail } from "@/lib/email/templates/invite";

const MARCA: MarcaDeSaida = {
  nome: "Turbo",
  logoUrl: null,
  accent: "#2f6f4e",
  accentFg: "#ffffff",
  origens: { nome: "banco", cor: "banco" },
};

const base = {
  inviterName: "Ana",
  orgName: "Clinic",
  acceptUrl: "https://crm.example.com/team/accept-invite/tok",
  role: "agent",
  expiresAt: new Date("2026-08-20T12:00:00.000Z"),
  marca: MARCA,
};

describe("convite de time por idioma", () => {
  it("sem idioma segue em português", () => {
    const { subject, html, text } = buildInviteEmail(base);
    expect(subject).toBe("Ana convidou você para a Clinic no Turbo");
    expect(html).toContain('<html lang="pt-BR">');
    expect(html).toContain("<strong>agent</strong> no Turbo.");
    expect(text).toContain("Você foi convidado para a Clinic como agent no Turbo.");
  });

  it("en sai todo em inglês, sem placeholder solto", () => {
    const { subject, html, text } = buildInviteEmail({ ...base, idioma: "en" });
    expect(subject).toBe("Ana invited you to Clinic on Turbo");
    expect(html).toContain('<html lang="en-US">');
    expect(html).toContain("Accept invite");
    expect(html).toContain("<strong>agent</strong> on Turbo.");
    expect(text).toContain("Accept: https://");
    for (const s of [subject, html, text]) expect(s).not.toMatch(/\{\w+\}|convid|Aceitar|expira/i);
  });
});
