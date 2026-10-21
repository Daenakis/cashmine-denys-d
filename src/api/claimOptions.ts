import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { useToken } from '@/token/useToken';

import { request } from './client';
import { unwrap } from './helpers';
import type { ApiError, ApiResult } from '@/types/apiError';
import { queryKeys } from './queryKeys';
import { decimalString } from './schemas';

export const claimOptionsSchema = z.object({
  asset: z.string(),
  minAmount: decimalString,
  fee: decimalString,
  destinations: z.array(z.object({ id: z.string(), label: z.string() })),
});

export type ClaimOptions = z.infer<typeof claimOptionsSchema>;

export function fetchClaimOptions(
  token: string | null,
  asset: string,
  signal?: AbortSignal,
): Promise<ApiResult<ClaimOptions>> {
  return request({
    token,
    path: `/v1/claim-options?asset=${encodeURIComponent(asset)}`,
    schema: claimOptionsSchema,
    signal,
  });
}

export function useClaimOptions(asset: string): UseQueryResult<ClaimOptions, ApiError> {
  const { token } = useToken();
  return useQuery<ClaimOptions, ApiError>({
    queryKey: queryKeys.claimOptions(asset),
    queryFn: async ({ signal }): Promise<ClaimOptions> => unwrap(await fetchClaimOptions(token, asset, signal)),
    enabled: token !== null && asset.length > 0,
  });
}
