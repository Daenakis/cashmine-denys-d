import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { type BalanceItem, useBalances } from '@/api/balances';
import { type ClaimOptions, useClaimOptions } from '@/api/claimOptions';
import { getApiErrorMessage } from '@/api/helpers';
import { canClaim, maxClaimAmount, validateClaimAmount } from '@/money/claim';
import type { ClaimRules, ClaimValidation } from '@/types/claim';
import type {
  AssetClaimStatus,
  ClaimFormStep,
  ClaimFormView,
  ClaimsContextValue,
  SubmitOutcome,
} from '@/types/claimTracking';

import { getClaimAmountErrorMessage, isClaimBlocked } from './helpers';
import { useClaims } from './useClaims';

export type ClaimForm = {
  view: ClaimFormView;
  item: BalanceItem | undefined;
  options: ClaimOptions | undefined;
  amount: string;
  setAmount: (value: string) => void;
  destinationId: string | null;
  setDestinationId: (id: string) => void;
  validation: ClaimValidation | null;
  amountError: string | null;
  serverError: string | null;
  submitting: boolean;
  setMax: () => void;
  review: () => void;
  edit: () => void;
  confirm: () => void;
  checkAgain: () => void;
  retryLoad: () => void;
};

export function useClaimForm(asset: string): ClaimForm {
  const balances = useBalances();
  const optionsQuery = useClaimOptions(asset);
  const { getAssetStatus, startAndSubmit, retryAttempt }: ClaimsContextValue = useClaims();

  const [amount, setAmountState] = useState<string>('');
  const [selectedDestination, setDestinationId] = useState<string | null>(null);
  const [step, setStep] = useState<ClaimFormStep>('edit');
  const [serverError, setServerError] = useState<string | null>(null);

  const item: BalanceItem | undefined = useMemo(
    (): BalanceItem | undefined => balances.data?.items.find((entry: BalanceItem): boolean => entry.asset === asset),
    [balances.data, asset],
  );
  const options: ClaimOptions | undefined = optionsQuery.data;
  const destinationId: string | null = selectedDestination ?? options?.destinations[0]?.id ?? null;
  const status: AssetClaimStatus = getAssetStatus(asset);

  const rules: ClaimRules | null = useMemo(
    (): ClaimRules | null =>
      item && options
        ? { decimals: item.decimals, available: item.available, minAmount: options.minAmount, fee: options.fee }
        : null,
    [item, options],
  );

  const validation: ClaimValidation | null = useMemo(
    (): ClaimValidation | null => (rules ? validateClaimAmount(amount, rules) : null),
    [amount, rules],
  );

  const amountError: string | null = useMemo((): string | null => {
    if (!validation || validation.ok || amount === '') return null;
    return getClaimAmountErrorMessage(validation.error, asset);
  }, [validation, amount, asset]);

  const setAmount = useCallback((value: string) => {
    setAmountState(value);
    setServerError(null);
  }, []);

  const setMax = useCallback(() => {
    if (item) setAmount(maxClaimAmount(item.available, item.decimals));
  }, [item, setAmount]);

  const review = useCallback(() => {
    if (validation?.ok && destinationId) setStep('review');
  }, [validation, destinationId]);

  const edit = useCallback(() => setStep('edit'), []);

  const handleOutcome = useCallback((outcome: SubmitOutcome) => {
    switch (outcome.kind) {
      case 'created':
        router.replace({ pathname: '/claims/[id]', params: { id: outcome.claim.id } });
        return;
      case 'rejected':
        setServerError(getApiErrorMessage(outcome.error));
        setStep('edit');
        return;
      case 'unknown':
      case 'busy':
        // The persisted attempt drives the "unknown" view; nothing else to do here.
        return;
    }
  }, []);

  const confirm = useCallback(() => {
    if (!validation?.ok || !destinationId) return;
    void startAndSubmit({ asset, amount: validation.data.amountString, destinationId }).then(handleOutcome);
  }, [asset, destinationId, handleOutcome, startAndSubmit, validation]);

  const checkAgain = useCallback(() => {
    void retryAttempt(asset).then(handleOutcome);
  }, [asset, handleOutcome, retryAttempt]);

  const retryLoad = useCallback(() => {
    void balances.refetch();
    void optionsQuery.refetch();
  }, [balances, optionsQuery]);

  const view: ClaimFormView = useMemo((): ClaimFormView => {
    if (status.kind === 'unknown') return { kind: 'unknown' };
    if (status.kind !== 'submitting' && isClaimBlocked(status)) {
      return { kind: 'blocked', claimId: 'claim' in status ? status.claim.id : null };
    }
    const error = balances.error ?? optionsQuery.error;
    if ((!balances.data || !options) && error) {
      return {
        kind: 'error',
        message: getApiErrorMessage(error),
        retrying: balances.isFetching || optionsQuery.isFetching,
      };
    }
    if (!balances.data || !options) return { kind: 'loading' };
    if (!item || !rules) return { kind: 'notFound' };
    if (!canClaim(rules) && status.kind !== 'submitting') return { kind: 'cannotClaim', minAmount: options.minAmount };
    return { kind: 'form', step: status.kind === 'submitting' ? 'review' : step };
  }, [balances, item, options, optionsQuery, rules, status, step]);

  return {
    view,
    item,
    options,
    amount,
    setAmount,
    destinationId,
    setDestinationId,
    validation,
    amountError,
    serverError,
    submitting: status.kind === 'submitting',
    setMax,
    review,
    edit,
    confirm,
    checkAgain,
    retryLoad,
  };
}
