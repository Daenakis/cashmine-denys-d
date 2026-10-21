import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { useToken } from '@/token/useToken';

import { request, unwrap } from './client';
import type { ApiError, Result } from './errors';
import { queryKeys } from './queryKeys';
import { decimalString, isoDateTime } from './schemas';

// Server recomputes the snapshot every 15 s.
export const BALANCES_REFRESH_MS: number = 15_000;

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

export function fetchBalances(token: string | null, signal?: AbortSignal): Promise<Result<Balances>> {
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
