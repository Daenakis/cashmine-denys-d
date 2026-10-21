import { DISPLAY_LOCALE, USD_CURRENCY, USD_DECIMALS } from '../constants/money.ts';
import type { DecimalString, Units } from '../types/amount.ts';
import { formatUnits } from './units.ts';

// Intl formats decimal strings exactly (no float conversion), so 18-decimal ETH survives.

export function formatAssetAmount(value: string, decimals: number): string {
  return new Intl.NumberFormat(DISPLAY_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value as DecimalString);
}

export function formatAssetUnits(units: Units, decimals: number): string {
  return formatAssetAmount(formatUnits(units, decimals), decimals);
}

export function formatUsdCents(cents: Units): string {
  return new Intl.NumberFormat(DISPLAY_LOCALE, {
    style: 'currency',
    currency: USD_CURRENCY,
  }).format(formatUnits(cents, USD_DECIMALS) as DecimalString);
}
