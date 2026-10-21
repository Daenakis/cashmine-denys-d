import { Stack, router } from 'expo-router';
import { type ReactElement, useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { strings } from '@/i18n/strings';
import { maskToken } from '@/token/helpers';
import { useToken } from '@/token/useToken';
import { Button } from '@/ui/Button';
import { colors, fontSize, fontWeight, sizes, spacing } from '@/constants/theme';

export default function HomeScreen(): ReactElement {
  const { token } = useToken();
  const hasToken: boolean = token !== null;

  const openToken = useCallback((): void => router.push('/token'), []);

  const renderHeaderRight = useCallback(
    (): ReactElement => (
      <TouchableOpacity testID="open-token" hitSlop={sizes.hitSlop} onPress={openToken} style={styles.headerButton}>
        <Text style={styles.headerButtonText}>{hasToken ? strings.home.tokenButton : strings.home.addTokenButton}</Text>
      </TouchableOpacity>
    ),
    [hasToken, openToken],
  );

  const screenOptions = useMemo(() => ({ headerRight: renderHeaderRight }), [renderHeaderRight]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={screenOptions} />
      {token ? (
        <Text testID="token-status" style={styles.text}>
          {strings.home.tokenSet(maskToken(token))}
        </Text>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.title}>{strings.home.emptyTitle}</Text>
          <Text style={styles.text}>{strings.home.emptyText}</Text>
          <Button testID="add-token" title={strings.home.addTokenButton} onPress={openToken} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  empty: { gap: spacing.md, marginTop: spacing.lg },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.text },
  text: { fontSize: fontSize.body, color: colors.muted },
  headerButton: { paddingHorizontal: spacing.md },
  headerButtonText: { color: colors.primary, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
