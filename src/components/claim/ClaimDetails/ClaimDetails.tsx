import { router } from 'expo-router';
import { type ReactElement, memo, useCallback, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useClaim } from '@/api/claims';
import { getApiErrorMessage } from '@/api/helpers';
import { getClaimStatusLabel } from '@/claims/helpers';
import { MAX_ASSET_DECIMALS } from '@/constants/money';
import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { strings } from '@/i18n/strings';
import { formatAssetAmount } from '@/money/format';
import { Button } from '@/ui/Button';
import { ErrorState } from '@/ui/ErrorState';
import { LoadingState } from '@/ui/LoadingState';

import { AmountRow } from '../../balances/AmountRow';
import type { ClaimDetailsProps } from './types';

export const ClaimDetails = memo(({ id }: ClaimDetailsProps): ReactElement => {
  const { data: claim, error, isFetching, refetch } = useClaim(id);

  const retry = useCallback(() => {
    void refetch();
  }, [refetch]);
  const goHome = useCallback(() => router.replace('/'), []);

  const statusStyle = useMemo(
    () => [
      styles.status,
      claim?.status === 'completed' && styles.completed,
      claim?.status === 'failed' && styles.failed,
    ],
    [claim?.status],
  );

  if (!claim) {
    if (error) {
      return (
        <View style={styles.content}>
          <ErrorState
            title={strings.claimStatus.error}
            message={getApiErrorMessage(error)}
            onRetry={retry}
            retrying={isFetching}
          />
        </View>
      );
    }
    return <LoadingState message={strings.claimStatus.loading} />;
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.statusRow}>
          {claim.status === 'pending' ? <ActivityIndicator color={colors.primary} /> : null}
          <Text style={statusStyle} testID="claim-status">
            {getClaimStatusLabel(claim.status)}
          </Text>
        </View>
        {claim.status === 'pending' ? <Text style={styles.hint}>{strings.claimStatus.pendingHint}</Text> : null}
        {claim.status === 'failed' ? (
          <Text style={styles.reason}>
            {`${strings.claimStatus.reason}: ${claim.failureReason ?? strings.home.unknownReason}`}
          </Text>
        ) : null}
        <AmountRow label={strings.claimStatus.amount} value={`${formatAssetAmount(claim.amount, MAX_ASSET_DECIMALS)} ${claim.asset}`} />
        <AmountRow label={strings.claimStatus.fee} value={`− ${formatAssetAmount(claim.fee, MAX_ASSET_DECIMALS)} ${claim.asset}`} />
        <AmountRow
          label={strings.claimStatus.receive}
          value={`${formatAssetAmount(claim.receiveAmount, MAX_ASSET_DECIMALS)} ${claim.asset}`}
          emphasized
        />
        <AmountRow label={strings.claimStatus.destination} value={claim.destinationId} />
        <AmountRow label={strings.claimStatus.created} value={new Date(claim.createdAt).toLocaleString()} />
        {error ? <Text style={styles.hint}>{getApiErrorMessage(error)}</Text> : null}
      </View>
      <Button variant="secondary" title={strings.claimStatus.backHome} onPress={goHome} />
    </ScrollView>
  );
});

ClaimDetails.displayName = 'ClaimDetails';

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  status: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.text },
  completed: { color: colors.success },
  failed: { color: colors.danger },
  hint: { fontSize: fontSize.sm, color: colors.muted },
  reason: { fontSize: fontSize.body, color: colors.danger },
});
