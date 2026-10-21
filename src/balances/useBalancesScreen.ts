import { useCallback, useMemo } from 'react';

import { type Balances, useBalances } from '@/api/balances';
import { getApiErrorMessage, isUnauthorized } from '@/api/helpers';
import { STALE_AFTER_MS } from '@/constants/time';
import { useNow } from '@/hooks/useNow';
import { formatUsdCents } from '@/money/format';
import type { BalanceTotals } from '@/types/balances';

import { computeTotals, formatAge, getAgeMs } from './helpers';

export type BalancesScreenState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string; unauthorized: boolean; retrying: boolean }
  | { kind: 'empty'; age: string }
  | {
      kind: 'success';
      data: Balances;
      total: string;
      availableTotal: string;
      age: string;
      stale: boolean;
      refreshFailed: boolean;
    };

export type BalancesScreen = {
  state: BalancesScreenState;
  refreshing: boolean;
  refresh: () => void;
};

export function useBalancesScreen(): BalancesScreen {
  const query = useBalances();
  const now: number = useNow();
  const { data, error, isPending, isFetching, refetch } = query;

  const totals: BalanceTotals | null = useMemo(
    (): BalanceTotals | null => (data ? computeTotals(data.items) : null),
    [data],
  );

  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const state: BalancesScreenState = useMemo((): BalancesScreenState => {
    if (!data) {
      if (error) {
        return {
          kind: 'error',
          message: getApiErrorMessage(error),
          unauthorized: isUnauthorized(error),
          retrying: isFetching,
        };
      }
      return { kind: 'loading' };
    }

    const ageMs: number = getAgeMs(data.asOf, now);
    const age: string = formatAge(ageMs);
    if (data.items.length === 0 || !totals) return { kind: 'empty', age };

    return {
      kind: 'success',
      data,
      total: formatUsdCents(totals.totalCents),
      availableTotal: formatUsdCents(totals.availableCents),
      age,
      stale: ageMs > STALE_AFTER_MS,
      // A background refetch failed but we still show the last good snapshot.
      refreshFailed: error !== null,
    };
  }, [data, error, isFetching, now, totals]);

  return { state, refreshing: isFetching && !isPending, refresh };
}
