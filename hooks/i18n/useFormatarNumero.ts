"use client";

import { useCallback } from "react";

import { formatarMoeda, formatarNumero } from "@/lib/i18n/numeros";
import { useTagDeIdioma } from "./useLocaleDeData";

/**
 * Hook para formatar números respeitando o idioma ativo na sessão.
 */
export function useFormatarNumero() {
  const tag = useTagDeIdioma();
  return useCallback(
    (valor: number, opcoes?: Intl.NumberFormatOptions) => formatarNumero(valor, tag, opcoes),
    [tag],
  );
}

/**
 * Hook para formatar moedas em centavos respeitando o idioma ativo na sessão.
 */
export function useFormatarMoeda() {
  const tag = useTagDeIdioma();
  return useCallback(
    (cents: number, moeda: string, opcoes?: Intl.NumberFormatOptions) =>
      formatarMoeda(cents, moeda, tag, opcoes),
    [tag],
  );
}
