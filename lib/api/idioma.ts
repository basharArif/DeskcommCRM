import { parseAcceptLanguage, type Idioma } from "@/lib/i18n/idiomas";

/**
 * Idioma pedido por quem chamou a API, para `fail(..., { locale })`.
 *
 * `null` sem `Accept-Language` válido: cliente de servidor (token `dsk_`) que não
 * manda o cabeçalho continua recebendo a mensagem como o call site a escreveu.
 */
export function idiomaDaRequisicao(req: Request): Idioma | null {
  return parseAcceptLanguage(req.headers.get("accept-language"));
}
