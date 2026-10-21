import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { type RefObject, useEffect, useRef } from 'react';

import { selectToken, useTokenStore } from '@/token/tokenStore';

// Data is private to a token: drop every cached response when the token changes.
export function useTokenScopedCache() {
  const queryClient: QueryClient = useQueryClient();
  const token: string | null = useTokenStore(selectToken);
  const previous: RefObject<string | null> = useRef<string | null>(token);

  useEffect(() => {
    if (previous.current === token) return;
    previous.current = token;
    queryClient.clear();
  }, [queryClient, token]);
}
