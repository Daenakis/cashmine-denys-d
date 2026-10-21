// Amounts are bigint counts of the asset's smallest unit. No floating point anywhere:
// API strings are parsed digit by digit and formatted back.

import { DECIMAL_STRING_REGEX, TRAILING_ZEROS_REGEX } from '../constants/regex.ts';
import type { ParseAmountResult, Units } from '../types/amount.ts';

export function parseAmount(input: string, decimals: number): ParseAmountResult {
  if (input.length === 0) return { ok: false, error: { kind: 'empty' } };
  if (!DECIMAL_STRING_REGEX.test(input)) return { ok: false, error: { kind: 'format' } };

  const [whole, fraction = ''] = input.split('.');
  if (fraction.length > decimals) return { ok: false, error: { kind: 'tooManyDecimals', decimals } };

  return { ok: true, data: BigInt(whole + fraction.padEnd(decimals, '0')) };
}

// For values the API already validated (balances, fees). Throws only on a contract breach,
// which the zod schemas should have caught first.
export function toUnits(value: string, decimals: number): Units {
  const result: ParseAmountResult = parseAmount(value, decimals);
  if (!result.ok) throw new Error(`Invalid API amount "${value}" for ${decimals} decimals`);
  return result.data;
}

// Canonical API string: no trailing zeros, no trailing dot ("0.5", "12").
export function formatUnits(units: Units, decimals: number): string {
  const negative: boolean = units < 0n;
  const digits: string = (negative ? -units : units).toString().padStart(decimals + 1, '0');
  const whole: string = digits.slice(0, digits.length - decimals);
  const fraction: string = digits.slice(digits.length - decimals).replace(TRAILING_ZEROS_REGEX, '');
  return `${negative ? '-' : ''}${whole}${fraction ? `.${fraction}` : ''}`;
}
