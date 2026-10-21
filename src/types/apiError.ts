import type { Result } from './result.ts';

export type ApiErrorCode =
  | 'VALIDATION'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'IDEMPOTENCY_MISMATCH'
  | 'RATE_LIMITED'
  | 'SERVER'
  | 'TIMEOUT'
  | 'UNKNOWN';

export type HttpApiError = {
  kind: 'http';
  status: number;
  code: ApiErrorCode;
  message: string;
  field?: string;
  retryAfterMs?: number;
};

// Errors are plain tagged values, never Error subclasses.
export type ApiError =
  | { kind: 'config'; message: string }
  | { kind: 'network'; message: string }
  | { kind: 'timeout' }
  | HttpApiError
  | { kind: 'parse'; message: string };

export type ApiResult<T> = Result<T, ApiError>;
