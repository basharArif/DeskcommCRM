import { LgpdRequestAdminDetail } from "./_client";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

export async function generateMetadata() {
  return metadadosLocalizados((t) => ({
    title: t("Solicitação LGPD — Admin"),
  }));
}

export default async function AdminLgpdRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LgpdRequestAdminDetail id={id} />;
}
