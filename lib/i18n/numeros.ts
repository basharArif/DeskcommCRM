import { IDIOMA_PADRAO, type Idioma } from "./idiomas";
import { REGISTRO_DE_IDIOMAS } from "./registro";

/**
 * Converte um código de idioma ("pt-BR", "es", "en") ou uma tag BCP-47 em tag válida.
 *
 * Idioma desconhecido ou indefinido devolve a tag BCP-47 do idioma padrão ("pt-BR").
 */
export function resolverTagBcp47(idiomaOuTag?: Idioma | string | null): string {
  if (!idiomaOuTag) {
    return REGISTRO_DE_IDIOMAS[0].tagBcp47;
  }
  const encontrado = REGISTRO_DE_IDIOMAS.find(
    (i) => i.codigo === idiomaOuTag || i.tagBcp47 === idiomaOuTag,
  );
  if (encontrado) {
    return encontrado.tagBcp47;
  }
  return idiomaOuTag;
}

/**
 * Formata um número segundo as convenções do idioma de quem lê.
 */
export function formatarNumero(
  valor: number,
  idiomaOuTag?: Idioma | string | null,
  opcoes?: Intl.NumberFormatOptions,
): string {
  const tag = resolverTagBcp47(idiomaOuTag);
  return valor.toLocaleString(tag, opcoes);
}

/**
 * Formata um valor monetário em centavos segundo a moeda e o idioma de quem lê.
 */
export function formatarMoeda(
  cents: number,
  moeda: string,
  idiomaOuTag?: Idioma | string | null,
  opcoes?: Intl.NumberFormatOptions,
): string {
  const tag = resolverTagBcp47(idiomaOuTag);
  const casas = opcoes?.maximumFractionDigits ?? 2;
  const valor = (cents ?? 0) / 100;
  try {
    return new Intl.NumberFormat(tag, {
      style: "currency",
      currency: moeda,
      ...opcoes,
    }).format(valor);
  } catch {
    return `${moeda || "?"} ${valor.toFixed(casas)}`;
  }
}
