import {
  type UseMutationResult,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { z } from 'zod';

import { useToken } from '@/token/useToken';

import { request, unwrap } from './client';
import { type ApiError, type Result, isRateLimited, isRetryable } from './errors';
import { queryKeys } from './queryKeys';
import { decimalString, isoDateTime } from './schemas';

// A pending claim settles in about 20 s.
const CLAIM_POLL_MS: number = 2_000;
const CREATE_CLAIM_MAX_RETRIES: number = 5;

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
): Promise<Result<Claim>> {
  return request({
    token,
    path: '/v1/claims',
    method: 'POST',
    schema: claimSchema,
    body,
    headers: { 'Idempotency-Key': idempotencyKey },
  });
}

export function fetchClaim(token: string | null, id: string, signal?: AbortSignal): Promise<Result<Claim>> {
  return request({ token, path: `/v1/claims/${encodeURIComponent(id)}`, schema: claimSchema, signal });
}

export function useCreateClaim(): UseMutationResult<Claim, ApiError, CreateClaimInput> {
  const { token } = useToken();
  const queryClient = useQueryClient();
  return useMutation<Claim, ApiError, CreateClaimInput>({
    mutationFn: async (input: CreateClaimInput): Promise<Claim> => unwrap(await createClaim(token, input)),
    // Retrying re-runs mutationFn with the same variables, so the same Idempotency-Key:
    // the server returns the original claim instead of creating a second one.
    retry: (failureCount: number, error: ApiError): boolean => failureCount < CREATE_CLAIM_MAX_RETRIES && isRetryable(error),
    retryDelay: (attempt: number, error: ApiError): number =>
      isRateLimited(error) && error.retryAfterMs ? error.retryAfterMs : Math.min(1000 * 2 ** attempt, 8000),
    onSuccess: (claim: Claim): void => {
      queryClient.setQueryData(queryKeys.claim(claim.id), claim);
      void queryClient.invalidateQueries({ queryKey: queryKeys.balances });
      void queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

export function useClaim(id: string): UseQueryResult<Claim, ApiError> {
  const { token } = useToken();
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
