import { Stack, router } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { strings } from '@/i18n/strings';
import { maskToken, useToken } from '@/storage/token';
import { Button } from '@/ui/Button';
import { colors, spacing } from '@/ui/theme';

export default function HomeScreen() {
  const token = useToken();
  const hasToken = token !== null;

  const openToken = useCallback(() => router.push('/token'), []);

  const renderHeaderRight = useCallback(
    () => (
      <TouchableOpacity testID="open-token" hitSlop={8} onPress={openToken} style={styles.headerButton}>
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
  title: { fontSize: 20, fontWeight: '600', color: colors.text },
  text: { fontSize: 15, color: colors.muted },
  headerButton: { paddingHorizontal: spacing.md },
  headerButtonText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
});
