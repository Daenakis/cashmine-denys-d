import { type ReactElement, memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, radius, spacing } from '@/constants/theme';
import { strings } from '@/i18n/strings';
import { Button } from '@/ui/Button';

import type { ErrorStateProps } from './types';

export const ErrorState = memo(({
  title,
  message,
  onRetry,
  retrying = false,
  secondaryAction,
}: ErrorStateProps): ReactElement => {
  return (
    <View style={styles.card} accessibilityRole="alert">
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Button
        title={retrying ? strings.common.refreshing : strings.common.retry}
        onPress={onRetry}
        disabled={retrying}
      />
      {secondaryAction ? (
        <Button variant="secondary" title={secondaryAction.title} onPress={secondaryAction.onPress} />
      ) : null}
    </View>
  );
});

ErrorState.displayName = 'ErrorState';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text },
  message: { fontSize: fontSize.body, color: colors.muted },
});
