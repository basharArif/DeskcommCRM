import { NovaCampanha } from "./_client";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return metadadosLocalizados((t) => ({ title: t("Nova campanha") }));
}

export default function NovaCampanhaPage() {
  return <NovaCampanha />;
}
