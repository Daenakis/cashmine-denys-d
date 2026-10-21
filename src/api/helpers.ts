import { HTTP_STATUS, KNOWN_API_ERROR_CODES } from '@/constants/api';
import { RETRY_BASE_DELAY_MS, RETRY_MAX_DELAY_MS } from '@/constants/query';
import { MS_PER_SECOND } from '@/constants/time';
import { strings } from '@/i18n/strings';
import type { ApiError, ApiErrorCode, ApiResult, HttpApiError } from '@/types/apiError';

import { errorEnvelopeSchema } from './schemas';

export function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'kind' in value;
}

export function isUnauthorized(error: ApiError): boolean {
  return error.kind === 'config' || (error.kind === 'http' && error.status === HTTP_STATUS.unauthorized);
}

export function isRateLimited(error: ApiError): error is HttpApiError {
  return error.kind === 'http' && error.status === HTTP_STATUS.tooManyRequests;
}

// The request may or may not have reached the server and been applied.
// For POST /v1/claims this means: retry with the same Idempotency-Key, never a new one.
export function isOutcomeUnknown(error: ApiError): boolean {
  if (error.kind === 'network' || error.kind === 'timeout') return true;
  return error.kind === 'http' && error.status >= HTTP_STATUS.serverErrorMin;
}

// Safe to retry automatically: transient failures and rate limiting.
export function isRetryable(error: ApiError): boolean {
  return isOutcomeUnknown(error) || isRateLimited(error);
}

// 429 waits as long as the server asks; everything else backs off exponentially.
export function getRetryDelay(attempt: number, error: ApiError): number {
  if (isRateLimited(error) && error.retryAfterMs) return error.retryAfterMs;
  return Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS);
}

function toKnownCode(code: string): ApiErrorCode {
  return KNOWN_API_ERROR_CODES.includes(code as ApiErrorCode) ? (code as ApiErrorCode) : 'UNKNOWN';
}

export function toHttpError(response: Response, json: unknown): ApiError {
  const envelope = errorEnvelopeSchema.safeParse(json);
  const retryAfterHeader: number = Number(response.headers.get('Retry-After'));
  const retryAfterFromHeader: number | undefined =
    Number.isFinite(retryAfterHeader) && retryAfterHeader > 0 ? retryAfterHeader * MS_PER_SECOND : undefined;

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
    code: toKnownCode(code),
    message,
    field,
    retryAfterMs: retryAfterMs ?? retryAfterFromHeader,
  };
}

// React Query expects thrown errors; we throw the tagged ApiError value itself.
export function unwrap<T>(result: ApiResult<T>): T {
  if (result.ok) return result.data;
  throw result.error;
}

// User-facing message for any API failure.
export function getApiErrorMessage(error: ApiError): string {
  switch (error.kind) {
    case 'config':
      return strings.errors.noToken;
    case 'network':
      return strings.errors.network;
    case 'timeout':
      return strings.errors.timeout;
    case 'parse':
      return strings.errors.parse;
    case 'http':
      if (error.status === HTTP_STATUS.unauthorized) return strings.errors.unauthorized;
      if (error.status === HTTP_STATUS.tooManyRequests) return strings.errors.rateLimited;
      if (error.status >= HTTP_STATUS.serverErrorMin) return strings.errors.server;
      return error.message;
  }
}
