import { PlatformAdminsClient } from "./_client";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

export async function generateMetadata() {
  return metadadosLocalizados((t) => ({ title: t("Platform Admins — Admin Plataforma") }));
}

export default function AdminPlatformAdminsPage() {
  return <PlatformAdminsClient />;
}
