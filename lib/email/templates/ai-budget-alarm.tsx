/**
 * AI budget alarm email (localized via `idioma`). Plain HTML — no React Email runtime.
 *
 * SEM CHAMADOR HOJE. O único era `workers/ai-budget-checker.cron.ts`, apagado na
 * limpeza do teto de orçamento (0159) por nunca ter tido agendador. Quem avisa o
 * cliente que o gasto passou do ponto escolhido é o item `budget_warning` na
 * Central (`agent_inbox_items`), aberto pelo próprio gate. Este arquivo fica de
 * pé porque o alarme POR E-MAIL continua sendo uma peça desejada.
 */
import { traduzir } from "@/lib/i18n/dicionario";
import { IDIOMA_PADRAO } from "@/lib/i18n/idiomas";
import { resolverTagBcp47 } from "@/lib/i18n/numeros";

export interface BudgetAlarmEmailOptions {
  idioma?: string;
  pct: number;
  consumedCents: number;
  limitCents: number;
  orgName?: string | null;
  dashboardUrl: string;
}

function fmt(cents: number, idioma: string): string {
  return new Intl.NumberFormat(resolverTagBcp47(idioma), {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function preencher(modelo: string, valores: Record<string, string>): string {
  return modelo.replace(/\{(\w+)\}/g, (m, k: string) => valores[k] ?? m);
}

export function buildBudgetAlarmEmail(opts: BudgetAlarmEmailOptions): {
  subject: string;
  html: string;
  text: string;
} {
  const idioma = opts.idioma ?? IDIOMA_PADRAO;
  const t = (texto: string) => traduzir(texto, idioma);
  const pctStr = `${opts.pct.toFixed(2)}%`;
  const consumido = fmt(opts.consumedCents, idioma);
  const limite = fmt(opts.limitCents, idioma);
  const subject = preencher(t("Alerta IA: orçamento atingiu {pct}"), { pct: pctStr });
  const orgLine = opts.orgName
    ? `<p style="margin:0 0 16px;font-size:14px;color:#57534e">${escapeHtml(t("Organização:"))} <strong>${escapeHtml(opts.orgName)}</strong></p>`
    : "";

  const html = `<!doctype html>
<html lang="${resolverTagBcp47(idioma)}">
<body style="margin:0;padding:0;background:#f5f5f4;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#1c1917">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <h1 style="font-size:22px;line-height:1.3;margin:0 0 16px;color:#0c0a09">
      ${escapeHtml(preencher(t("Orçamento mensal de IA atingiu {pct}"), { pct: pctStr }))}
    </h1>
    ${orgLine}
    <p style="margin:0 0 12px;font-size:15px;line-height:1.5">
      ${preencher(t("Consumo no mês: {consumido} de {limite}."), { consumido: `<strong>${escapeHtml(consumido)}</strong>`, limite: `<strong>${escapeHtml(limite)}</strong>` })}
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#57534e">
      ${escapeHtml(t("Ao atingir 100%, o bot de IA será automaticamente pausado ou desabilitado conforme a política configurada. Atendimento humano segue normalmente."))}
    </p>
    <p style="margin:24px 0">
      <a href="${opts.dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#0ea5e9;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:600">
        ${escapeHtml(t("Ver dashboard de uso"))}
      </a>
    </p>
    <p style="margin:24px 0 0;font-size:12px;color:#78716c">
      ${escapeHtml(t("Este alerta é enviado automaticamente uma vez a cada 24h enquanto o consumo permanecer acima do limite configurado."))}
    </p>
  </div>
</body>
</html>`;

  const text = [
    preencher(t("Orçamento mensal de IA atingiu {pct}."), { pct: pctStr }),
    opts.orgName ? `${t("Organização:")} ${opts.orgName}` : "",
    preencher(t("Consumo: {consumido} de {limite}."), { consumido, limite }),
    "",
    `${t("Dashboard:")} ${opts.dashboardUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
