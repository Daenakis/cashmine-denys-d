import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { BALANCES_REFRESH_MS } from '@/constants/query';
import { useToken } from '@/token/useToken';

import { request } from './client';
import { unwrap } from './helpers';
import type { ApiError, ApiResult } from '@/types/apiError';
import { queryKeys } from './queryKeys';
import { decimalString, isoDateTime } from './schemas';

export const balanceItemSchema = z.object({
  asset: z.string(),
  decimals: z.number().int().nonnegative(),
  available: decimalString,
  pending: decimalString,
  claiming: decimalString,
  usdPrice: decimalString,
});

export const balancesSchema = z.object({
  asOf: isoDateTime,
  items: z.array(balanceItemSchema),
});

export type BalanceItem = z.infer<typeof balanceItemSchema>;
export type Balances = z.infer<typeof balancesSchema>;

export function fetchBalances(token: string | null, signal?: AbortSignal): Promise<ApiResult<Balances>> {
  return request({ token, path: '/v1/balances', schema: balancesSchema, signal });
}

export function useBalances(): UseQueryResult<Balances, ApiError> {
  const { token } = useToken();
  return useQuery<Balances, ApiError>({
    queryKey: queryKeys.balances,
    queryFn: async ({ signal }): Promise<Balances> => unwrap(await fetchBalances(token, signal)),
    enabled: token !== null,
    refetchInterval: BALANCES_REFRESH_MS,
  });
}
