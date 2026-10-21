import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { type ApiError, isApiError, isRateLimited, isRetryable, isUnauthorized } from './errors';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}

const MAX_QUERY_RETRIES: number = 3;

function openTokenOnUnauthorized(error: unknown): void {
  if (isApiError(error) && isUnauthorized(error)) router.push('/token');
}

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({ onError: openTokenOnUnauthorized }),
    mutationCache: new MutationCache({ onError: openTokenOnUnauthorized }),
    defaultOptions: {
      queries: {
        retry: (failureCount: number, error: ApiError): boolean => failureCount < MAX_QUERY_RETRIES && isRetryable(error),
        retryDelay: (attempt: number, error: ApiError): number =>
          isRateLimited(error) && error.retryAfterMs ? error.retryAfterMs : Math.min(1000 * 2 ** attempt, 8000),
      },
      mutations: { retry: false },
    },
  });
}
