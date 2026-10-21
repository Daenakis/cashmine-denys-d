import { type ReactElement, memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { strings } from '@/i18n/strings';
import { Button } from '@/ui/Button';

import type { BalanceSummaryProps } from './types';

export const BalanceSummary = memo(({
  total,
  availableTotal,
  age,
  stale,
  refreshFailed,
  refreshing,
  onRefresh,
}: BalanceSummaryProps): ReactElement => {
  const freshnessStyle = useMemo(
    () => [styles.freshness, (stale || refreshFailed) && styles.warning],
    [stale, refreshFailed],
  );

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{strings.home.totalLabel}</Text>
      <Text style={styles.total} testID="total-usd">
        {total}
      </Text>
      <Text style={styles.hint}>{strings.home.totalHint}</Text>
      <View style={styles.availableRow}>
        <Text style={styles.label}>{strings.home.availableTotalLabel}</Text>
        <Text style={styles.available}>{availableTotal}</Text>
      </View>
      <Text style={freshnessStyle} testID="freshness">
        {refreshFailed ? strings.home.refreshFailed(age) : strings.home.updatedAgo(age)}
      </Text>
      {stale && !refreshFailed ? <Text style={styles.warning}>{strings.home.staleWarning}</Text> : null}
      <Button
        variant="secondary"
        title={refreshing ? strings.common.refreshing : strings.common.refresh}
        onPress={onRefresh}
        disabled={refreshing}
      />
    </View>
  );
});

BalanceSummary.displayName = 'BalanceSummary';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  label: { fontSize: fontSize.label, color: colors.muted },
  total: { fontSize: fontSize.xxl, fontWeight: fontWeight.semibold, color: colors.text, fontVariant: ['tabular-nums'] },
  hint: { fontSize: fontSize.sm, color: colors.muted },
  availableRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  available: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.text },
  freshness: { fontSize: fontSize.sm, color: colors.muted, marginVertical: spacing.sm },
  warning: { fontSize: fontSize.sm, color: colors.warning },
});
