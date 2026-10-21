import type { z } from 'zod';

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '@/constants/api';
import type { ApiResult } from '@/types/apiError';

import { toHttpError } from './helpers';

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
}: RequestOptions<S>): Promise<ApiResult<z.infer<S>>> {
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
