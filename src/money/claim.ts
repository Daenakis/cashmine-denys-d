import type { ParseAmountResult, Units } from '../types/amount.ts';
import type { ClaimRules, ClaimValidation } from '../types/claim.ts';
import { normalizeAmountInput } from './helpers.ts';
import { formatUnits, parseAmount, toUnits } from './units.ts';

// minAmount <= amount <= available, at most `decimals` places, and the user must receive > 0.
export function validateClaimAmount(input: string, rules: ClaimRules): ClaimValidation {
  const parsed: ParseAmountResult = parseAmount(normalizeAmountInput(input), rules.decimals);
  if (!parsed.ok) return parsed;

  const amount: Units = parsed.data;
  const available: Units = toUnits(rules.available, rules.decimals);
  const minAmount: Units = toUnits(rules.minAmount, rules.decimals);
  const fee: Units = toUnits(rules.fee, rules.decimals);

  if (amount < minAmount) return { ok: false, error: { kind: 'belowMin', minAmount: rules.minAmount } };
  if (amount > available) return { ok: false, error: { kind: 'aboveAvailable', available: rules.available } };
  if (amount <= fee) return { ok: false, error: { kind: 'notAboveFee', fee: rules.fee } };

  return {
    ok: true,
    data: { amount, fee, receive: amount - fee, amountString: formatUnits(amount, rules.decimals) },
  };
}

// Max fills in the full available balance, in canonical API form.
export function maxClaimAmount(available: string, decimals: number): string {
  return formatUnits(toUnits(available, decimals), decimals);
}

export function canClaim(rules: ClaimRules): boolean {
  const available: Units = toUnits(rules.available, rules.decimals);
  const minAmount: Units = toUnits(rules.minAmount, rules.decimals);
  const fee: Units = toUnits(rules.fee, rules.decimals);
  return available >= minAmount && available > fee;
}
