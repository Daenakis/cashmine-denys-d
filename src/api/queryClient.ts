import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import { MAX_QUERY_RETRIES } from '@/constants/query';
import type { ApiError } from '@/types/apiError';

import { getRetryDelay, isApiError, isRetryable, isUnauthorized } from './helpers';

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: ApiError;
  }
}

function openTokenOnUnauthorized(error: unknown) {
  if (isApiError(error) && isUnauthorized(error)) router.push('/token');
}

export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({ onError: openTokenOnUnauthorized }),
    mutationCache: new MutationCache({ onError: openTokenOnUnauthorized }),
    defaultOptions: {
      queries: {
        retry: (failureCount: number, error: ApiError): boolean => failureCount < MAX_QUERY_RETRIES && isRetryable(error),
        retryDelay: getRetryDelay,
      },
      mutations: { retry: false },
    },
  });
}
