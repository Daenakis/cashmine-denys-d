import type { Units } from './amount.ts';

export type BalanceTotals = {
  // available + pending + claiming, in USD cents.
  totalCents: Units;
  availableCents: Units;
};
