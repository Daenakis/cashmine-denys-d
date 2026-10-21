import type { z } from 'zod';

import { API_BASE_URL } from './config';
import type { ApiError, ApiErrorCode, Result } from './errors';
import { errorEnvelopeSchema } from './schemas';

const REQUEST_TIMEOUT_MS: number = 20_000;

const KNOWN_CODES: readonly ApiErrorCode[] = [
  'VALIDATION',
  'UNAUTHORIZED',
  'NOT_FOUND',
  'IDEMPOTENCY_MISMATCH',
  'RATE_LIMITED',
  'SERVER',
  'TIMEOUT',
];

type RequestOptions<S extends z.ZodType> = {
  token: string | null;
  path: string;
  schema: S;
  method?: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function request<S extends z.ZodType>({
  token,
  path,
  schema,
  method = 'GET',
  body,
  headers,
  signal,
}: RequestOptions<S>): Promise<Result<z.infer<S>>> {
  if (!token) return { ok: false, error: { kind: 'config', message: 'API token is not set' } };

  const controller: AbortController = new AbortController();
  const timeout: ReturnType<typeof setTimeout> = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const onExternalAbort = (): void => controller.abort();
  signal?.addEventListener('abort', onExternalAbort);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    const aborted: boolean = controller.signal.aborted && !signal?.aborted;
    return {
      ok: false,
      error: aborted ? { kind: 'timeout' } : { kind: 'network', message: String(cause) },
    };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onExternalAbort);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    json = undefined;
  }

  if (!response.ok) return { ok: false, error: toHttpError(response, json) };

  const parsed = schema.safeParse(json);
  if (!parsed.success) return { ok: false, error: { kind: 'parse', message: parsed.error.message } };
  return { ok: true, data: parsed.data };
}

function toHttpError(response: Response, json: unknown): ApiError {
  const envelope = errorEnvelopeSchema.safeParse(json);
  const retryAfterHeader: number = Number(response.headers.get('Retry-After'));
  const retryAfterFromHeader: number | undefined = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
    ? retryAfterHeader * 1000
    : undefined;

  if (!envelope.success) {
    return {
      kind: 'http',
      status: response.status,
      code: 'UNKNOWN',
      message: response.statusText || `HTTP ${response.status}`,
      retryAfterMs: retryAfterFromHeader,
    };
  }

  const { code, message, field, retryAfterMs } = envelope.data.error;
  return {
    kind: 'http',
    status: response.status,
    code: KNOWN_CODES.includes(code as ApiErrorCode) ? (code as ApiErrorCode) : 'UNKNOWN',
    message,
    field,
    retryAfterMs: retryAfterMs ?? retryAfterFromHeader,
  };
}

// React Query expects thrown errors; we throw the tagged ApiError value itself.
export function unwrap<T>(result: Result<T>): T {
  if (result.ok) return result.data;
  throw result.error;
}
