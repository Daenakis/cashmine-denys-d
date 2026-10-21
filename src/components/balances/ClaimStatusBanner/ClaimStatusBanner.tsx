import { type ReactElement, memo, useCallback, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, sizes, spacing } from '@/constants/theme';
import { strings } from '@/i18n/strings';
import { formatAssetAmount } from '@/money/format';

import type { ClaimStatusBannerProps } from './types';

export const ClaimStatusBanner = memo(
  ({ asset, decimals, status, onViewClaim, onDismiss, onCheckAgain }: ClaimStatusBannerProps): ReactElement | null => {
    const claimId: string | null = 'claim' in status ? status.claim.id : null;

    const view = useCallback(() => {
      if (claimId) onViewClaim(claimId);
    }, [claimId, onViewClaim]);

    const dismiss = useCallback(() => {
      if (claimId) onDismiss(claimId);
    }, [claimId, onDismiss]);

    const checkAgain = useCallback(() => onCheckAgain(asset), [asset, onCheckAgain]);

    const content = useMemo((): { text: string; tone: 'info' | 'warning' | 'danger'; busy: boolean } | null => {
      switch (status.kind) {
        case 'none':
          return null;
        case 'submitting':
          return { text: strings.home.statusSubmitting, tone: 'info', busy: true };
        case 'unknown':
          return { text: strings.home.statusUnknown, tone: 'warning', busy: false };
        case 'pending':
          return {
            text: strings.home.statusPending(formatAssetAmount(status.claim.amount, decimals), asset),
            tone: 'info',
            busy: true,
          };
        case 'syncing':
          return { text: strings.home.statusSyncing, tone: 'info', busy: true };
        case 'failed':
          return {
            text: strings.home.statusFailed(
              formatAssetAmount(status.claim.amount, decimals),
              asset,
              status.claim.failureReason ?? strings.home.unknownReason,
            ),
            tone: 'danger',
            busy: false,
          };
      }
    }, [asset, decimals, status]);

    const containerStyle = useMemo(
      () => [styles.banner, content?.tone === 'warning' && styles.warning, content?.tone === 'danger' && styles.danger],
      [content?.tone],
    );

    if (!content) return null;

    return (
      <View style={containerStyle} accessibilityRole="alert" testID={`claim-status-${asset}`}>
        <View style={styles.row}>
          {content.busy ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          <Text style={styles.text}>{content.text}</Text>
        </View>
        {status.kind === 'pending' && status.syncing ? <Text style={styles.hint}>{strings.home.statusSyncing}</Text> : null}
        <View style={styles.actions}>
          {status.kind === 'unknown' ? (
            <TouchableOpacity hitSlop={sizes.hitSlop} onPress={checkAgain}>
              <Text style={styles.link}>{strings.home.checkAgain}</Text>
            </TouchableOpacity>
          ) : null}
          {claimId ? (
            <TouchableOpacity hitSlop={sizes.hitSlop} onPress={view}>
              <Text style={styles.link}>{strings.home.viewClaim}</Text>
            </TouchableOpacity>
          ) : null}
          {status.kind === 'failed' ? (
            <TouchableOpacity hitSlop={sizes.hitSlop} onPress={dismiss}>
              <Text style={styles.link}>{strings.home.dismiss}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  },
);

ClaimStatusBanner.displayName = 'ClaimStatusBanner';

const styles = StyleSheet.create({
  banner: {
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
    backgroundColor: colors.infoBackground,
  },
  warning: { backgroundColor: colors.warningBackground },
  danger: { backgroundColor: colors.dangerBackground },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { flex: 1, fontSize: fontSize.label, color: colors.text },
  hint: { fontSize: fontSize.sm, color: colors.muted },
  actions: { flexDirection: 'row', gap: spacing.md },
  link: { fontSize: fontSize.label, fontWeight: fontWeight.semibold, color: colors.primary },
});
