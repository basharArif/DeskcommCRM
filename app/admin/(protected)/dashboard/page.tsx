import { DashboardClient } from "./_client";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

export async function generateMetadata() {
  return metadadosLocalizados((t) => ({ title: t("Dashboard — Admin Plataforma") }));
}

export default function AdminDashboardPage() {
  return <DashboardClient />;
}
