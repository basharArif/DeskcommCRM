/**
 * Stores GEMINI_API_KEY (from .env / .env.local / shell) as the org's Google
 * provider credential, through the same path the UI uses (AES-GCM + audit).
 *
 * Run: npx tsx scripts/seed-ai-provider.ts [--label "Gemini (dev)"]
 * Org/user come from .e2e-creds.json. Idempotent: an existing label is skipped.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { carregarEnvLocal } from "./lib/env-de-teste";

carregarEnvLocal();
for (const linha of fs.readFileSync(path.join(process.cwd(), ".env"), "utf8").split("\n")) {
  const m = /^([A-Z0-9_]+)=(.*)$/.exec(linha.trim());
  if (m && !process.env[m[1]!]) process.env[m[1]!] = m[2]!;
}

async function main(): Promise<void> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY ausente em .env / .env.local");

  const i = process.argv.indexOf("--label");
  const label = i > 0 ? process.argv[i + 1]! : "Gemini (dev)";

  const creds = JSON.parse(fs.readFileSync(path.join(process.cwd(), ".e2e-creds.json"), "utf8")) as {
    org_id: string;
    users: Record<string, { id: string }>;
  };

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const { guardarCredencial } = await import("@/lib/ai/credenciais/guardar");
  const admin = createAdminClient();

  const r = await guardarCredencial({
    admin,
    orgId: creds.org_id,
    userId: creds.users.admin!.id,
    provider: "google",
    label,
    apiKey,
  });
  if (!r.ok && r.motivo === "label_em_uso") {
    console.log(`Credencial "${label}" já existe — nada a fazer.`);
    return;
  }
  if (!r.ok) throw new Error(`${r.motivo}: ${r.detalhe ?? ""}`);
  console.log(`✅ Credencial Google guardada (…${r.last4}). Ver em /app/settings (Inteligência artificial).`);
}

main().catch((e) => {
  console.error("❌", e instanceof Error ? e.message : e);
  process.exit(1);
});
