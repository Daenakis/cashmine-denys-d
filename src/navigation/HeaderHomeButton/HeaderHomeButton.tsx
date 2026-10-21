import { router } from 'expo-router';
import { type ReactElement, memo, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors, fontSize, fontWeight, sizes, spacing } from '@/constants/theme';
import { strings } from '@/i18n/strings';

// Deep-linked screens have no history, so the header has no back arrow; Home is always reachable.
export const HeaderHomeButton = memo((): ReactElement => {
  const goHome = useCallback(() => {
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/');
  }, []);

  return (
    <TouchableOpacity testID="header-home" hitSlop={sizes.hitSlop} onPress={goHome} style={styles.button}>
      <Text style={styles.text}>{strings.navigation.home}</Text>
    </TouchableOpacity>
  );
});

HeaderHomeButton.displayName = 'HeaderHomeButton';

const styles = StyleSheet.create({
  button: { paddingHorizontal: spacing.md },
  text: { color: colors.primary, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
