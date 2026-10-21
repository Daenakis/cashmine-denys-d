import { router } from 'expo-router';
import { type ReactElement, memo, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { BalanceItem } from '@/api/balances';
import { type BalancesScreen, useBalancesScreen } from '@/balances/useBalancesScreen';
import { isClaimBlocked } from '@/claims/helpers';
import { useClaims } from '@/claims/useClaims';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { strings } from '@/i18n/strings';
import type { AssetClaimStatus, ClaimsContextValue } from '@/types/claimTracking';
import { Button } from '@/ui/Button';
import { ErrorState } from '@/ui/ErrorState';
import { LoadingState } from '@/ui/LoadingState';

import { AssetCard } from '../AssetCard';
import { BalanceSummary } from '../BalanceSummary';
import type { BalancesContentProps } from './types';

export const BalancesContent = memo(({
  onChangeToken,
}: BalancesContentProps): ReactElement => {
  const { state, refreshing, refresh }: BalancesScreen = useBalancesScreen();
  const { getAssetStatus, dismissClaim, retryAttempt }: ClaimsContextValue = useClaims();

  const openClaim = useCallback((asset: string) => {
    router.push({ pathname: '/claim/[asset]', params: { asset } });
  }, []);

  const viewClaim = useCallback((id: string) => {
    router.push({ pathname: '/claims/[id]', params: { id } });
  }, []);

  const checkAgain = useCallback(
    (asset: string) => {
      void retryAttempt(asset);
    },
    [retryAttempt],
  );

  const changeTokenAction = useMemo(
    () => ({ title: strings.home.changeToken, onPress: onChangeToken }),
    [onChangeToken],
  );

  switch (state.kind) {
    case 'loading':
      return <LoadingState message={strings.home.loadingBalances} />;
    case 'error':
      return (
        <ErrorState
          title={strings.home.errorTitle}
          message={state.message}
          onRetry={refresh}
          retrying={state.retrying}
          secondaryAction={state.unauthorized ? changeTokenAction : undefined}
        />
      );
    case 'empty':
      return (
        <View style={styles.empty}>
          <Text style={styles.title}>{strings.home.noAssetsTitle}</Text>
          <Text style={styles.text}>{strings.home.noAssetsText}</Text>
          <Text style={styles.text}>{strings.home.updatedAgo(state.age)}</Text>
          <Button variant="secondary" title={strings.common.refresh} onPress={refresh} disabled={refreshing} />
        </View>
      );
    case 'success':
      return (
        <View style={styles.list}>
          <BalanceSummary
            total={state.total}
            availableTotal={state.availableTotal}
            age={state.age}
            stale={state.stale}
            refreshFailed={state.refreshFailed}
            refreshing={refreshing}
            onRefresh={refresh}
          />
          {state.data.items.map(
            (item: BalanceItem): ReactElement => {
              const claimStatus: AssetClaimStatus = getAssetStatus(item.asset);
              return (
                <AssetCard
                  key={item.asset}
                  item={item}
                  claimStatus={claimStatus}
                  claimBlocked={isClaimBlocked(claimStatus)}
                  onClaim={openClaim}
                  onViewClaim={viewClaim}
                  onDismissClaim={dismissClaim}
                  onCheckAgain={checkAgain}
                />
              );
            },
          )}
        </View>
      );
  }
});

BalancesContent.displayName = 'BalancesContent';

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  empty: { gap: spacing.md, marginTop: spacing.lg },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.text },
  text: { fontSize: fontSize.body, color: colors.muted },
});
