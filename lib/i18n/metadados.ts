import { cache } from "react";
import type { Metadata } from "next";

import { loadAuthUser } from "@/lib/auth/server";
import { traduzir } from "@/lib/i18n/dicionario";
import { idiomaDoVisitante } from "@/lib/i18n/idiomaAnonimo";
import { IDIOMA_PADRAO, type Idioma } from "@/lib/i18n/idiomas";

/** Mesma cadeia do `IdiomaProvider`; `loadAuthUser` é memoizado por requisição, então não custa consulta extra. */
export const idiomaDaRequisicao = cache(async (): Promise<Idioma> => {
  try {
    const user = await loadAuthUser();
    return user ? user.idioma : await idiomaDoVisitante(null);
  } catch {
    return IDIOMA_PADRAO;
  }
});

/** `t` recebe o texto em português (a chave) e devolve no idioma de quem vê; mantém o nome `t` para a varredura de chaves enxergar o literal. */
export async function metadadosLocalizados(
  montar: (t: (pt: string) => string) => Metadata,
): Promise<Metadata> {
  const idioma = await idiomaDaRequisicao();
  return montar((pt) => traduzir(pt, idioma));
}
