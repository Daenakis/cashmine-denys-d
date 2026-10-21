import { type UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { CLAIM_POLL_MS } from '@/constants/query';
import { selectToken, useTokenStore } from '@/token/tokenStore';
import type { ApiError, ApiResult } from '@/types/apiError';

import { request } from './client';
import { unwrap } from './helpers';
import { queryKeys } from './queryKeys';
import { decimalString, isoDateTime } from './schemas';

export const claimStatusSchema = z.enum(['pending', 'completed', 'failed']);

export const claimSchema = z.object({
  id: z.string(),
  asset: z.string(),
  amount: decimalString,
  fee: decimalString,
  receiveAmount: decimalString,
  destinationId: z.string(),
  status: claimStatusSchema,
  failureReason: z.string().nullable(),
  createdAt: isoDateTime,
  updatedAt: isoDateTime,
});

export type Claim = z.infer<typeof claimSchema>;
export type ClaimStatus = z.infer<typeof claimStatusSchema>;

export type CreateClaimInput = {
  asset: string;
  amount: string;
  destinationId: string;
  // Generated once per user-confirmed attempt and reused on every retry of it.
  idempotencyKey: string;
};

export function createClaim(
  token: string | null,
  { idempotencyKey, ...body }: CreateClaimInput,
): Promise<ApiResult<Claim>> {
  return request({
    token,
    path: '/v1/claims',
    method: 'POST',
    schema: claimSchema,
    body,
    headers: { 'Idempotency-Key': idempotencyKey },
  });
}

export function fetchClaim(token: string | null, id: string, signal?: AbortSignal): Promise<ApiResult<Claim>> {
  return request({ token, path: `/v1/claims/${encodeURIComponent(id)}`, schema: claimSchema, signal });
}

export function useClaim(id: string): UseQueryResult<Claim, ApiError> {
  const token: string | null = useTokenStore(selectToken);
  const queryClient = useQueryClient();
  return useQuery<Claim, ApiError>({
    queryKey: queryKeys.claim(id),
    queryFn: async ({ signal }): Promise<Claim> => {
      const claim: Claim = unwrap(await fetchClaim(token, id, signal));
      if (claim.status !== 'pending') {
        void queryClient.invalidateQueries({ queryKey: queryKeys.balances });
      }
      return claim;
    },
    enabled: token !== null && id.length > 0,
    refetchInterval: (query): number | false => (query.state.data?.status === 'pending' ? CLAIM_POLL_MS : false),
  });
}
