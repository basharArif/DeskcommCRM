import { UsersClient } from "./_client";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

export async function generateMetadata() {
  return metadadosLocalizados((t) => ({ title: t("Usuários — Admin Plataforma") }));
}

export default function AdminUsersPage() {
  return <UsersClient />;
}
