import { LgpdAdminClient } from "./_client";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

export async function generateMetadata() {
  return metadadosLocalizados((t) => ({
    title: t("LGPD — Admin"),
  }));
}

export default function AdminLgpdPage() {
  return <LgpdAdminClient />;
}
