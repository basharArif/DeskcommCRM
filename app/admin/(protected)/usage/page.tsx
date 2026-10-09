import { UsageClient } from "./_client";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

export async function generateMetadata() {
  return metadadosLocalizados((t) => ({ title: t("Uso & Custo — Admin Plataforma") }));
}

export default function AdminUsagePage() {
  return <UsageClient />;
}
