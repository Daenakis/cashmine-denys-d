import { type ReactElement, memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/constants/theme';

import { DestinationOption } from '../DestinationOption';
import type { Destination, DestinationPickerProps } from './types';

export const DestinationPicker = memo(
  ({ destinations, selectedId, onSelect, disabled = false }: DestinationPickerProps): ReactElement => (
    <View style={styles.list} accessibilityRole="radiogroup">
      {destinations.map(
        (destination: Destination): ReactElement => (
          <DestinationOption
            key={destination.id}
            id={destination.id}
            label={destination.label}
            selected={destination.id === selectedId}
            disabled={disabled}
            onSelect={onSelect}
          />
        ),
      )}
    </View>
  ),
);

DestinationPicker.displayName = 'DestinationPicker';

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
});
