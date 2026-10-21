import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useBalances } from '@/api/balances';
import { type Claim, createClaim } from '@/api/claims';
import { getRetryDelay, isRetryable } from '@/api/helpers';
import { createIdempotencyKey } from '@/api/idempotency';
import { queryKeys } from '@/api/queryKeys';
import { CREATE_CLAIM_MAX_RETRIES } from '@/constants/query';
import { useToken } from '@/token/useToken';
import type { ApiResult } from '@/types/apiError';
import type {
  AssetClaimStatus,
  ClaimAttempt,
  ClaimRequestBody,
  ClaimsContextValue,
  ClaimsState,
  SubmitOutcome,
  TrackedClaim,
} from '@/types/claimTracking';

import { ClaimsContext } from '../ClaimsContext';
import { EMPTY_CLAIMS_STATE, readStoredClaims, writeStoredClaims } from '../claimStorage';
import { getAssetClaimStatus, pruneClaims, sleep, toTrackedClaim } from '../helpers';
import { useClaimStatusSync } from '../useClaimStatusSync';
import type { ClaimsProviderProps } from './types';

export const ClaimsProvider = ({ children }: ClaimsProviderProps): ReactElement => {
  const { token } = useToken();
  const queryClient: QueryClient = useQueryClient();
  const asOf: string | undefined = useBalances().data?.asOf;

  const [state, setState] = useState<ClaimsState>(readStoredClaims);
  const stateRef = useRef<ClaimsState>(state);
  const tokenRef = useRef<string | null>(token);
  const inFlight = useRef<Set<string>>(new Set());

  // Persist synchronously: the attempt must be on disk before the POST leaves.
  const commit = useCallback((update: (previous: ClaimsState) => ClaimsState) => {
    const next: ClaimsState = update(stateRef.current);
    stateRef.current = next;
    writeStoredClaims(next);
    setState(next);
  }, []);

  // Claims belong to a token: forget them when the token changes.
  useEffect(() => {
    if (tokenRef.current === token) return;
    tokenRef.current = token;
    commit((): ClaimsState => EMPTY_CLAIMS_STATE);
  }, [token, commit]);

  const recordClaim = useCallback(
    (claim: Claim) => {
      commit((previous: ClaimsState): ClaimsState => {
        const { [claim.asset]: _resolved, ...attempts } = previous.attempts;
        const others: TrackedClaim[] = previous.claims.filter((item: TrackedClaim): boolean => item.id !== claim.id);
        return { attempts, claims: [...others, toTrackedClaim(claim)] };
      });
    },
    [commit],
  );

  const updateClaim = useCallback(
    (claim: Claim) => {
      commit((previous: ClaimsState): ClaimsState => ({
        ...previous,
        claims: previous.claims.map(
          (item: TrackedClaim): TrackedClaim =>
            item.id === claim.id
              ? { ...item, status: claim.status, failureReason: claim.failureReason, updatedAt: claim.updatedAt }
              : item,
        ),
      }));
    },
    [commit],
  );

  const setAttempt = useCallback(
    (attempt: ClaimAttempt) => {
      commit((previous: ClaimsState): ClaimsState => ({
        ...previous,
        attempts: { ...previous.attempts, [attempt.asset]: attempt },
      }));
    },
    [commit],
  );

  const dropAttempt = useCallback(
    (asset: string) => {
      commit((previous: ClaimsState): ClaimsState => {
        const { [asset]: _dropped, ...attempts } = previous.attempts;
        return { ...previous, attempts };
      });
    },
    [commit],
  );

  // Same Idempotency-Key and body on every retry: the server returns the original claim
  // instead of creating a second one, even if an earlier response was lost.
  const submit = useCallback(
    async (attempt: ClaimAttempt): Promise<SubmitOutcome> => {
      if (inFlight.current.has(attempt.asset)) return { kind: 'busy' };
      inFlight.current.add(attempt.asset);
      setAttempt({ ...attempt, status: 'submitting' });

      try {
        for (let retry: number = 0; ; retry += 1) {
          const result: ApiResult<Claim> = await createClaim(tokenRef.current, attempt);
          if (result.ok) {
            recordClaim(result.data);
            queryClient.setQueryData(queryKeys.claim(result.data.id), result.data);
            void queryClient.invalidateQueries({ queryKey: queryKeys.balances });
            return { kind: 'created', claim: result.data };
          }
          if (!isRetryable(result.error)) {
            // A definitive answer (400, 401, 409…): no claim was created for this key.
            dropAttempt(attempt.asset);
            return { kind: 'rejected', error: result.error };
          }
          if (retry >= CREATE_CLAIM_MAX_RETRIES) {
            setAttempt({ ...attempt, status: 'unknown' });
            return { kind: 'unknown', error: result.error };
          }
          await sleep(getRetryDelay(retry, result.error));
        }
      } finally {
        inFlight.current.delete(attempt.asset);
      }
    },
    [dropAttempt, queryClient, recordClaim, setAttempt],
  );

  const startAndSubmit = useCallback(
    (body: ClaimRequestBody): Promise<SubmitOutcome> => {
      const existing: ClaimAttempt | undefined = stateRef.current.attempts[body.asset];
      if (existing) return submit(existing);
      return submit({ ...body, idempotencyKey: createIdempotencyKey(), status: 'submitting' });
    },
    [submit],
  );

  const retryAttempt = useCallback(
    (asset: string): Promise<SubmitOutcome> => {
      const existing: ClaimAttempt | undefined = stateRef.current.attempts[asset];
      return existing ? submit(existing) : Promise.resolve<SubmitOutcome>({ kind: 'busy' });
    },
    [submit],
  );

  const dismissClaim = useCallback(
    (id: string) => {
      commit((previous: ClaimsState): ClaimsState => ({
        ...previous,
        claims: previous.claims.map(
          (item: TrackedClaim): TrackedClaim => (item.id === id ? { ...item, dismissed: true } : item),
        ),
      }));
    },
    [commit],
  );

  // After a reload, finish any submission whose outcome we never learned.
  useEffect(() => {
    if (!token) return;
    Object.values(stateRef.current.attempts).forEach((attempt: ClaimAttempt) => {
      void submit(attempt);
    });
    // Run once per token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useClaimStatusSync(token, state.claims, updateClaim);

  // Forget claims that settled and already show up in the server snapshot.
  useEffect(() => {
    const pruned: TrackedClaim[] = pruneClaims(stateRef.current.claims, asOf);
    if (pruned.length !== stateRef.current.claims.length) {
      commit((previous: ClaimsState): ClaimsState => ({ ...previous, claims: pruneClaims(previous.claims, asOf) }));
    }
  }, [asOf, state.claims, commit]);

  const getAssetStatus = useCallback(
    (asset: string): AssetClaimStatus => getAssetClaimStatus(state, asset, asOf),
    [state, asOf],
  );

  const value: ClaimsContextValue = useMemo(
    (): ClaimsContextValue => ({ state, startAndSubmit, retryAttempt, dismissClaim, getAssetStatus }),
    [state, startAndSubmit, retryAttempt, dismissClaim, getAssetStatus],
  );

  return <ClaimsContext.Provider value={value}>{children}</ClaimsContext.Provider>;
};
