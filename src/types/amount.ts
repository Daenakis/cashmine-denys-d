import type { Result } from './result.ts';

// Count of the asset's smallest unit (10^-decimals).
export type Units = bigint;

export type AmountError =
  | { kind: 'empty' }
  | { kind: 'format' }
  | { kind: 'tooManyDecimals'; decimals: number };

export type ParseAmountResult = Result<Units, AmountError>;

// What Intl.NumberFormat accepts as an exact decimal string.
export type DecimalString = `${number}`;
