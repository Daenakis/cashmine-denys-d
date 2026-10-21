import type { AmountError, Units } from './amount.ts';
import type { Result } from './result.ts';

export type ClaimRules = {
  decimals: number;
  available: string;
  minAmount: string;
  fee: string;
};

export type ClaimAmountError =
  | AmountError
  | { kind: 'belowMin'; minAmount: string }
  | { kind: 'aboveAvailable'; available: string }
  | { kind: 'notAboveFee'; fee: string };

export type ClaimQuote = {
  amount: Units;
  fee: Units;
  receive: Units;
  // Exactly what is sent to POST /v1/claims.
  amountString: string;
};

export type ClaimValidation = Result<ClaimQuote, ClaimAmountError>;
