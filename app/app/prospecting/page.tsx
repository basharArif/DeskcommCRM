import { redirect } from "next/navigation";
import { requireAuth, resolveActiveOrg } from "@/lib/auth/server";
import { ProspectingClient } from "./_client";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return metadadosLocalizados((t) => ({ title: t("Prospecção") }));
}
export default async function ProspectingPage() {
  const user = await requireAuth();
  const org = await resolveActiveOrg(user);
  if (org?.role !== "admin") redirect("/app/inbox");
  return <ProspectingClient />;
}
