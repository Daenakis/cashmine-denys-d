import { type ReactElement, memo, useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { activeOpacity, colors, fontSize, radius, sizes, spacing } from '@/constants/theme';

import type { DestinationOptionProps } from './types';

export const DestinationOption = memo(
  ({ id, label, selected, disabled, onSelect }: DestinationOptionProps): ReactElement => {
    const select = useCallback(() => onSelect(id), [id, onSelect]);
    const a11yState = useMemo(() => ({ checked: selected, disabled }), [selected, disabled]);

    return (
      <TouchableOpacity
        accessibilityRole="radio"
        accessibilityState={a11yState}
        activeOpacity={activeOpacity}
        disabled={disabled}
        onPress={select}
        style={selected ? styles.selected : styles.option}
      >
        <View style={selected ? styles.radioOn : styles.radioOff} />
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>
    );
  },
);

DestinationOption.displayName = 'DestinationOption';

const option = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: spacing.sm,
  minHeight: sizes.control,
  paddingHorizontal: spacing.sm,
  borderRadius: radius.md,
  borderWidth: 1,
} as const;

const radio = { width: spacing.md, height: spacing.md, borderRadius: spacing.sm, borderWidth: 2 } as const;

const styles = StyleSheet.create({
  option: { ...option, borderColor: colors.border },
  selected: { ...option, borderColor: colors.primary, backgroundColor: colors.infoBackground },
  radioOff: { ...radio, borderColor: colors.border },
  radioOn: { ...radio, borderColor: colors.primary, backgroundColor: colors.primary },
  label: { flex: 1, fontSize: fontSize.body, color: colors.text },
});
