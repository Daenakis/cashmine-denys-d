import type { Units } from '../types/amount.ts';

// What the user types: trimmed, comma accepted as the decimal separator.
export function normalizeAmountInput(input: string): string {
  return input.trim().replace(',', '.');
}

export function countDecimals(value: string): number {
  const dot: number = value.indexOf('.');
  return dot === -1 ? 0 : value.length - dot - 1;
}

export function sumUnits(values: readonly Units[]): Units {
  return values.reduce((total: Units, value: Units): Units => total + value, 0n);
}

export function pow10(exponent: number): Units {
  return 10n ** BigInt(exponent);
}
