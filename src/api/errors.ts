// Errors are plain tagged values, never Error subclasses.

export type ApiErrorCode =
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'IDEMPOTENCY_MISMATCH'
  | 'RATE_LIMITED'
  | 'SERVER'
  | 'TIMEOUT'
  | 'UNKNOWN';

export type ApiError =
  | { kind: 'config'; message: string }
  | { kind: 'network'; message: string }
  | { kind: 'timeout' }
  | {
      kind: 'http';
      status: number;
      code: ApiErrorCode;
      message: string;
      field?: string;
      retryAfterMs?: number;
    }
  | { kind: 'parse'; message: string };

export type Result<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export function isApiError(value: unknown): value is ApiError {
  return typeof value === 'object' && value !== null && 'kind' in value;
}

export function isUnauthorized(error: ApiError): boolean {
  return error.kind === 'config' || (error.kind === 'http' && error.status === 401);
}

export function isRateLimited(error: ApiError): error is Extract<ApiError, { kind: 'http' }> {
  return error.kind === 'http' && error.status === 429;
}

// The request may or may not have reached the server and been applied.
// For POST /v1/claims this means: retry with the same Idempotency-Key, never a new one.
export function isOutcomeUnknown(error: ApiError): boolean {
  if (error.kind === 'network' || error.kind === 'timeout') return true;
  return error.kind === 'http' && error.status >= 500;
}

// Safe to retry automatically: transient failures and rate limiting.
export function isRetryable(error: ApiError): boolean {
  return isOutcomeUnknown(error) || isRateLimited(error);
}
