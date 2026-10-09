import { AuditDetailClient } from "./_client";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

interface AuditDetailPageProps {
  params: Promise<{ entryId: string }>;
}

export async function generateMetadata() {
  return metadadosLocalizados((t) => ({
    title: t("Audit Entry — Admin"),
  }));
}

export default async function AuditDetailPage({ params }: AuditDetailPageProps) {
  const { entryId } = await params;
  return <AuditDetailClient entryId={entryId} />;
}
