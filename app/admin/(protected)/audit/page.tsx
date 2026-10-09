import { AuditClient } from "./_client";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

export async function generateMetadata() {
  return metadadosLocalizados((t) => ({
    title: t("Audit Log — Admin"),
  }));
}

export default function AdminAuditPage() {
  return <AuditClient />;
}
