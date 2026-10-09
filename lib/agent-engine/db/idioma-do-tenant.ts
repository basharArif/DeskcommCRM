import type pg from 'pg';
import { normalizarIdioma, type Idioma } from '@/lib/i18n/idiomas';

/** Idioma da org para texto gravado por SQL cru; nunca lança, sem org ou sem linha cai em português. */
export async function idiomaDoTenant(db: Pick<pg.Pool, 'query'>, tenantId: string | null): Promise<Idioma> {
  if (!tenantId) return 'pt-BR';
  try {
    const res = await db.query<{ locale: string | null }>('select locale from organizations where id = $1', [tenantId]);
    return normalizarIdioma(res?.rows?.[0]?.locale ?? null);
  } catch {
    return 'pt-BR';
  }
}
