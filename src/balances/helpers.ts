import type { BalanceItem } from '@/api/balances';
import { MS_PER_SECOND, SECONDS_PER_HOUR, SECONDS_PER_MINUTE } from '@/constants/time';
import { strings } from '@/i18n/strings';
import { sumUnits } from '@/money/helpers';
import { toUnits } from '@/money/units';
import { usdCents } from '@/money/usd';
import type { Units } from '@/types/amount';
import type { BalanceTotals } from '@/types/balances';

export function computeTotals(items: readonly BalanceItem[]): BalanceTotals {
  return {
    totalCents: sumUnits(
      items.flatMap((item: BalanceItem): Units[] => [
        usdCents(item.available, item.decimals, item.usdPrice),
        usdCents(item.pending, item.decimals, item.usdPrice),
        usdCents(item.claiming, item.decimals, item.usdPrice),
      ]),
    ),
    availableCents: sumUnits(
      items.map((item: BalanceItem): Units => usdCents(item.available, item.decimals, item.usdPrice)),
    ),
  };
}

export function isZeroAmount(value: string, decimals: number): boolean {
  return toUnits(value, decimals) === 0n;
}

// Clock skew can make asOf look like the future; treat that as "just now".
export function getAgeMs(asOf: string, now: number): number {
  return Math.max(0, now - Date.parse(asOf));
}

export function formatAge(ageMs: number): string {
  const seconds: number = Math.floor(ageMs / MS_PER_SECOND);
  if (seconds < 1) return strings.time.justNow;
  if (seconds < SECONDS_PER_MINUTE) return strings.time.secondsAgo(seconds);
  if (seconds < SECONDS_PER_HOUR) return strings.time.minutesAgo(Math.floor(seconds / SECONDS_PER_MINUTE));
  return strings.time.hoursAgo(Math.floor(seconds / SECONDS_PER_HOUR));
}
