import { type ReactElement, memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors, spacing } from './theme';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  testID?: string;
};

export const Button = memo(function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  testID,
}: Props): ReactElement {
  const containerStyle = useMemo(
    () => [styles.base, styles[variant], disabled && styles.disabled],
    [variant, disabled],
  );

  const labelStyle = useMemo(
    () => [styles.label, variant !== 'primary' && styles[`${variant}Label`]],
    [variant],
  );

  return (
    <TouchableOpacity
      accessibilityRole="button"
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.8}
      style={containerStyle}
    >
      <Text style={labelStyle}>{title}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  danger: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.danger },
  disabled: { opacity: 0.5 },
  label: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
  secondaryLabel: { color: colors.text },
  dangerLabel: { color: colors.danger },
});
