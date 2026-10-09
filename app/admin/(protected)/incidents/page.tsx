import { IncidentsClient } from "./_client";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

export async function generateMetadata() {
  return metadadosLocalizados((t) => ({ title: t("Incidentes — Admin Plataforma") }));
}

export default function AdminIncidentsPage() {
  return <IncidentsClient />;
}
