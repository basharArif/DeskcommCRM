import { IncidentDetailClient } from "./_client";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

export async function generateMetadata() {
  return metadadosLocalizados((t) => ({ title: t("Detalhe do Incidente — Admin Plataforma") }));
}

export default async function AdminIncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <IncidentDetailClient id={id} />;
}
