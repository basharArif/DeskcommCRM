/**
 * Wrappers canônicos de API (sucesso e erro).
 *
 * Toda rota `/api/v1/*` DEVE usar `ok()` / `fail()` em vez de NextResponse direto.
 * Garante:
 *  - Formato consistente { data, meta? } / { error: { code, message, details? } }
 *  - Header X-Request-Id correlacionando com audit log
 *  - Status codes corretos (200/201/204/400/401/403/404/409/422/429/500)
 */

import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import type { ApiErrorCode } from "@/lib/api/errors";
import { workUnitAsyncStorage } from "next/dist/server/app-render/work-unit-async-storage.external";
import { traduzirTextoDeCodigo } from "@/lib/i18n/dicionario";
import { parseAcceptLanguage } from "@/lib/i18n/idiomas";

// -----------------------------------------------------------------------------
// Tipos públicos
// -----------------------------------------------------------------------------

export type CursorMeta = {
  cursor?: string | null;
  has_more?: boolean;
  total?: number | null;
};

export type ApiSuccess<T> = {
  data: T;
  meta?: CursorMeta & Record<string, unknown>;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

type OkOptions = {
  status?: 200 | 201 | 204;
  meta?: ApiSuccess<unknown>["meta"];
  requestId?: string;
  headers?: HeadersInit;
};

export function ok<T>(data: T, opts: OkOptions = {}): NextResponse<ApiSuccess<T>> {
  const { status = 200, meta, requestId, headers } = opts;
  const body: ApiSuccess<T> = meta ? { data, meta } : { data };

  const res = NextResponse.json(body, { status, headers });
  res.headers.set("X-Request-Id", requestId ?? randomUUID());
  return res;
}

type FailOptions = {
  details?: unknown;
  /** Idioma de quem chamou; `undefined` usa o Accept-Language da requisição em curso, `null` mantém o texto do call site. */
  locale?: string | null;
  requestId?: string;
  headers?: HeadersInit;
};

/**
 * Idioma da requisição em curso, lido do store de request do Next (sem I/O).
 * Fora de uma requisição, ou se a API interna mudar, devolve null.
 */
function idiomaDaRequisicaoEmCurso(): string | null {
  try {
    const store = workUnitAsyncStorage.getStore();
    if (store?.type !== "request") return null;
    return parseAcceptLanguage(store.headers.get("accept-language"));
  } catch {
    return null;
  }
}

export function fail(
  code: ApiErrorCode | (string & {}),
  message: string,
  status: number,
  opts: FailOptions = {},
): NextResponse<ApiError> {
  const locale = opts.locale === undefined ? idiomaDaRequisicaoEmCurso() : opts.locale;
  const body: ApiError = {
    error: {
      code,
      message: locale ? traduzirTextoDeCodigo(message, locale) : message,
      ...(opts.details !== undefined ? { details: opts.details } : {}),
    },
  };

  const res = NextResponse.json(body, { status, headers: opts.headers });
  res.headers.set("X-Request-Id", opts.requestId ?? randomUUID());
  return res;
}

// -----------------------------------------------------------------------------
// Atalhos comuns
// -----------------------------------------------------------------------------

export const noContent = (requestId?: string) => {
  const res = new NextResponse(null, { status: 204 });
  res.headers.set("X-Request-Id", requestId ?? randomUUID());
  return res;
};
