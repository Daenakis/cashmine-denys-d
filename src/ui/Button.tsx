import { type ReactElement, memo, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { activeOpacity, colors, disabledOpacity, fontSize, fontWeight, radius, sizes, spacing } from '@/constants/theme';

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
      activeOpacity={activeOpacity}
      style={containerStyle}
    >
      <Text style={labelStyle}>{title}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.control,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  danger: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.danger },
  disabled: { opacity: disabledOpacity },
  label: { color: colors.primaryText, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  secondaryLabel: { color: colors.text },
  dangerLabel: { color: colors.danger },
});
