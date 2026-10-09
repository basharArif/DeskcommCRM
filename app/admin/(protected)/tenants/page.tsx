import { TenantsClient } from "./_client";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

export async function generateMetadata() {
  return metadadosLocalizados((t) => ({ title: t("Tenants — Admin Plataforma") }));
}

export default function AdminTenantsPage() {
  return <TenantsClient />;
}
