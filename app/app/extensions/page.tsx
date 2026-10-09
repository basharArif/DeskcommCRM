import { redirect } from "next/navigation";

import { ExtensionsManager } from "@/components/extensions/ExtensionsManager";
import { requireAuth, resolveActiveOrg } from "@/lib/auth/server";
import { metadadosLocalizados } from "@/lib/i18n/metadados";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return metadadosLocalizados((t) => ({ title: t("Extensões") }));
}

export default async function ExtensionsPage() {
  const user = await requireAuth();
  const activeOrg = await resolveActiveOrg(user);
  if (!activeOrg) redirect("/app");

  return (
    <ExtensionsManager
      key={activeOrg.orgId}
      organizationId={activeOrg.orgId}
      actorId={user.id}
      supportMode={Boolean(user.support)}
    />
  );
}
