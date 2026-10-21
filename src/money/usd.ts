import { USD_DECIMALS } from '../constants/money.ts';
import type { Units } from '../types/amount.ts';
import { countDecimals, pow10 } from './helpers.ts';
import { toUnits } from './units.ts';

// amount × price, in USD cents, rounded down so we never overstate value.
export function usdCents(amount: string, decimals: number, usdPrice: string): Units {
  const priceDecimals: number = countDecimals(usdPrice);
  const product: Units = toUnits(amount, decimals) * toUnits(usdPrice, priceDecimals);
  const scale: number = decimals + priceDecimals - USD_DECIMALS;
  return scale >= 0 ? product / pow10(scale) : product * pow10(-scale);
}
