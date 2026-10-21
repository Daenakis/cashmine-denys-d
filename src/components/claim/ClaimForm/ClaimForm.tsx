import { router } from 'expo-router';
import { type ReactElement, memo, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { type ClaimForm as ClaimFormState, useClaimForm } from '@/claims/useClaimForm';
import { colors, fontSize, fontWeight, radius, sizes, spacing } from '@/constants/theme';
import { strings } from '@/i18n/strings';
import { formatAssetAmount, formatAssetUnits } from '@/money/format';
import { Button } from '@/ui/Button';
import { ErrorState } from '@/ui/ErrorState';
import { LoadingState } from '@/ui/LoadingState';

import { AmountRow } from '../../balances/AmountRow';
import { DestinationPicker } from '../DestinationPicker';
import type { ClaimFormProps } from './types';

export const ClaimForm = memo(({ asset }: ClaimFormProps): ReactElement => {
  const form: ClaimFormState = useClaimForm(asset);
  const { view, item, options, validation } = form;

  const goHome = useCallback(() => router.replace('/'), []);
  const viewClaim = useCallback(() => {
    if (view.kind === 'blocked' && view.claimId) {
      router.replace({ pathname: '/claims/[id]', params: { id: view.claimId } });
    }
  }, [view]);

  const renderBody = (): ReactElement => {
    switch (view.kind) {
      case 'loading':
        return <LoadingState message={strings.claim.loadingOptions} />;
      case 'error':
        return (
          <ErrorState
            title={strings.claim.optionsError}
            message={view.message}
            onRetry={form.retryLoad}
            retrying={view.retrying}
          />
        );
      case 'notFound':
        return <Text style={styles.text}>{strings.claim.assetNotFound(asset)}</Text>;
      case 'unknown':
        return (
          <View style={styles.card} accessibilityRole="alert">
            <Text style={styles.title}>{strings.claim.unknownTitle}</Text>
            <Text style={styles.text}>{strings.claim.unknownText}</Text>
            <Button title={strings.home.checkAgain} onPress={form.checkAgain} />
            <Button variant="secondary" title={strings.claimStatus.backHome} onPress={goHome} />
          </View>
        );
      case 'blocked':
        return (
          <View style={styles.card}>
            <Text style={styles.text}>{strings.claim.blocked}</Text>
            {view.claimId ? <Button title={strings.home.viewClaim} onPress={viewClaim} /> : null}
            <Button variant="secondary" title={strings.claimStatus.backHome} onPress={goHome} />
          </View>
        );
      case 'cannotClaim':
        return (
          <View style={styles.card}>
            <Text style={styles.text}>{strings.claim.cannotClaim(view.minAmount, asset)}</Text>
            <Button variant="secondary" title={strings.claimStatus.backHome} onPress={goHome} />
          </View>
        );
      case 'form':
        break;
    }

    if (!item || !options) return <LoadingState message={strings.claim.loadingOptions} />;
    const quote = validation?.ok ? validation.data : null;

    if (view.step === 'review' && quote) {
      return (
        <View style={styles.card}>
          <Text style={styles.title}>{strings.claim.reviewTitle}</Text>
          <AmountRow label={strings.claim.youClaim} value={`${formatAssetUnits(quote.amount, item.decimals)} ${asset}`} />
          <AmountRow label={strings.claim.fee} value={`− ${formatAssetUnits(quote.fee, item.decimals)} ${asset}`} />
          <AmountRow
            label={strings.claim.youReceive}
            value={`${formatAssetUnits(quote.receive, item.decimals)} ${asset}`}
            emphasized
          />
          <AmountRow
            label={strings.claim.destination}
            value={options.destinations.find((d): boolean => d.id === form.destinationId)?.label ?? ''}
          />
          <Button
            testID="confirm-claim"
            title={form.submitting ? strings.claim.submitting : strings.claim.confirm}
            onPress={form.confirm}
            disabled={form.submitting}
          />
          <Button variant="secondary" title={strings.claim.edit} onPress={form.edit} disabled={form.submitting} />
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <AmountRow label={strings.claim.available} value={`${formatAssetAmount(item.available, item.decimals)} ${asset}`} />
        <AmountRow label={strings.claim.minAmount} value={`${formatAssetAmount(options.minAmount, item.decimals)} ${asset}`} />
        <AmountRow label={strings.claim.fee} value={`${formatAssetAmount(options.fee, item.decimals)} ${asset}`} />

        <Text style={styles.label}>{strings.claim.amountLabel}</Text>
        <View style={styles.inputRow}>
          <TextInput
            testID="amount-input"
            value={form.amount}
            onChangeText={form.setAmount}
            placeholder={strings.claim.amountPlaceholder}
            placeholderTextColor={colors.muted}
            inputMode="decimal"
            autoCorrect={false}
            autoComplete="off"
            style={styles.input}
          />
          <TouchableOpacity testID="max-button" hitSlop={sizes.hitSlop} onPress={form.setMax} style={styles.max}>
            <Text style={styles.maxText}>{strings.claim.max}</Text>
          </TouchableOpacity>
        </View>
        {form.amountError ? <Text style={styles.error}>{form.amountError}</Text> : null}
        {form.serverError ? <Text style={styles.error}>{form.serverError}</Text> : null}

        {quote ? (
          <View style={styles.quote}>
            <AmountRow label={strings.claim.fee} value={`− ${formatAssetUnits(quote.fee, item.decimals)} ${asset}`} />
            <AmountRow
              label={strings.claim.youReceive}
              value={`${formatAssetUnits(quote.receive, item.decimals)} ${asset}`}
              emphasized
            />
          </View>
        ) : null}

        <Text style={styles.label}>{strings.claim.destination}</Text>
        <DestinationPicker
          destinations={options.destinations}
          selectedId={form.destinationId}
          onSelect={form.setDestinationId}
        />

        <Button
          testID="review-claim"
          title={strings.claim.review}
          onPress={form.review}
          disabled={!quote || !form.destinationId}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {renderBody()}
    </ScrollView>
  );
});

ClaimForm.displayName = 'ClaimForm';

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text },
  text: { fontSize: fontSize.body, color: colors.muted },
  label: { fontSize: fontSize.label, color: colors.muted, marginTop: spacing.sm },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    flex: 1,
    minHeight: sizes.control,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  max: { paddingHorizontal: spacing.md, minHeight: sizes.control, justifyContent: 'center' },
  maxText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.primary },
  error: { fontSize: fontSize.label, color: colors.danger },
  quote: { gap: spacing.xs, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
});
