import { NewTenantForm } from "./_form";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

export async function generateMetadata() {
  return metadadosLocalizados((t) => ({ title: t("Novo Tenant — Admin Plataforma") }));
}

export default function NewTenantPage() {
  return <NewTenantForm />;
}
