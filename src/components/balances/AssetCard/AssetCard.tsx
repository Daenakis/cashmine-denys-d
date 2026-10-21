import { type ReactElement, memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { isZeroAmount } from '@/balances/helpers';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { strings } from '@/i18n/strings';
import { formatAssetAmount, formatUsdCents } from '@/money/format';
import { usdCents } from '@/money/usd';

import { AmountRow } from '../AmountRow';
import type { AssetCardProps } from './types';

export const AssetCard = memo(({ item }: AssetCardProps): ReactElement => {
  const view = useMemo(
    () => ({
      available: formatAssetAmount(item.available, item.decimals),
      availableUsd: formatUsdCents(usdCents(item.available, item.decimals, item.usdPrice)),
      pending: formatAssetAmount(item.pending, item.decimals),
      claiming: formatAssetAmount(item.claiming, item.decimals),
      pendingZero: isZeroAmount(item.pending, item.decimals),
      claimingZero: isZeroAmount(item.claiming, item.decimals),
    }),
    [item],
  );

  return (
    <View style={styles.card} testID={`asset-${item.asset}`}>
      <View style={styles.header}>
        <Text style={styles.asset}>{item.asset}</Text>
        <Text style={styles.usd}>{view.availableUsd}</Text>
      </View>
      <AmountRow label={strings.home.available} value={`${view.available} ${item.asset}`} emphasized />
      <AmountRow
        label={strings.home.pending}
        hint={strings.home.pendingHint}
        value={`${view.pending} ${item.asset}`}
        muted={view.pendingZero}
      />
      <AmountRow label={strings.home.claiming} value={`${view.claiming} ${item.asset}`} muted={view.claimingZero} />
    </View>
  );
});

AssetCard.displayName = 'AssetCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  asset: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text },
  usd: { fontSize: fontSize.body, color: colors.muted },
});
