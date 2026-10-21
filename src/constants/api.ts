import type { ApiErrorCode } from '@/types/apiError';

// The single place where the API base URL is defined.
export const API_BASE_URL: string = 'https://task-api.cashmine.io';

export const REQUEST_TIMEOUT_MS: number = 20_000;

export const MS_PER_SECOND: number = 1000;

export const HTTP_STATUS = {
  unauthorized: 401,
  tooManyRequests: 429,
  serverErrorMin: 500,
} as const;

export const KNOWN_API_ERROR_CODES: readonly ApiErrorCode[] = [
  'VALIDATION',
  'UNAUTHORIZED',
  'NOT_FOUND',
  'IDEMPOTENCY_MISMATCH',
  'RATE_LIMITED',
  'SERVER',
  'TIMEOUT',
];
