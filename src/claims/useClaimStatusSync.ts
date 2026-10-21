import { type QueryClient, useQueries, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { type Claim, fetchClaim } from '@/api/claims';
import { unwrap } from '@/api/helpers';
import { queryKeys } from '@/api/queryKeys';
import { CLAIM_POLL_MS } from '@/constants/query';
import type { TrackedClaim } from '@/types/claimTracking';

// Polls every pending claim we created until it settles, and reports each update.
export function useClaimStatusSync(
  token: string | null,
  claims: readonly TrackedClaim[],
  onUpdate: (claim: Claim) => void,
) {
  const queryClient: QueryClient = useQueryClient();
  const pendingIds: string[] = claims
    .filter((claim: TrackedClaim): boolean => claim.status === 'pending')
    .map((claim: TrackedClaim): string => claim.id);

  const results = useQueries({
    queries: pendingIds.map((id: string) => ({
      queryKey: queryKeys.claim(id),
      queryFn: async ({ signal }: { signal: AbortSignal }): Promise<Claim> => unwrap(await fetchClaim(token, id, signal)),
      enabled: token !== null,
      refetchInterval: (query: { state: { data?: Claim } }): number | false =>
        query.state.data?.status === 'pending' ? CLAIM_POLL_MS : false,
    })),
  });

  const settled: Claim[] = results
    .map((result): Claim | undefined => result.data)
    .filter((claim: Claim | undefined): claim is Claim => claim !== undefined && claim.status !== 'pending');
  const settledKey: string = settled.map((claim: Claim): string => `${claim.id}:${claim.status}`).join(',');

  useEffect(() => {
    if (settled.length === 0) return;
    settled.forEach(onUpdate);
    // The settlement changes available/claiming on the server; ask for a fresh snapshot.
    void queryClient.invalidateQueries({ queryKey: queryKeys.balances });
    // settledKey captures the relevant changes of `settled`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settledKey]);
}
