import { type ReactElement, memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';

import type { AmountRowProps } from './types';

export const AmountRow = memo(({
  label,
  value,
  hint,
  emphasized = false,
  muted = false,
}: AmountRowProps): ReactElement => {
  const valueStyle = useMemo(
    () => [styles.value, emphasized && styles.emphasized, muted && styles.muted],
    [emphasized, muted],
  );

  return (
    <View style={styles.row}>
      <View style={styles.labelColumn}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Text style={valueStyle} selectable>
        {value}
      </Text>
    </View>
  );
});

AmountRow.displayName = 'AmountRow';

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm },
  labelColumn: { flexShrink: 0 },
  label: { fontSize: fontSize.body, color: colors.muted },
  hint: { fontSize: fontSize.sm, color: colors.muted },
  value: { flex: 1, textAlign: 'right', fontSize: fontSize.body, color: colors.text, fontVariant: ['tabular-nums'] },
  emphasized: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  muted: { color: colors.muted },
});
