import { ConfiguracaoDeCampanhas } from "./_client";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return metadadosLocalizados((t) => ({ title: t("Configuração de campanhas") }));
}

export default function ConfiguracaoDeCampanhasPage() {
  return <ConfiguracaoDeCampanhas />;
}
