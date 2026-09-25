import { createAdminClient } from "@/lib/supabase/admin";
import { IDIOMA_PADRAO, normalizarIdioma, type Idioma } from "./idiomas";

/** Texto server-side sem sessão (e-mail, cron, Central) segue o idioma da org; nunca lança. */
export async function idiomaDaOrganizacao(organizationId: string): Promise<Idioma> {
  try {
    const { data } = await createAdminClient()
      .from("organizations")
      .select("locale")
      .eq("id", organizationId)
      .maybeSingle();
    return normalizarIdioma(data?.locale);
  } catch {
    return IDIOMA_PADRAO;
  }
}
