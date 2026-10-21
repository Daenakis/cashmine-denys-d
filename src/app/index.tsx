import { Stack, router } from 'expo-router';
import { type ReactElement, useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { BalancesContent } from '@/components/balances/BalancesContent';
import { colors, fontSize, fontWeight, sizes, spacing } from '@/constants/theme';
import { strings } from '@/i18n/strings';
import { useToken } from '@/token/useToken';
import { Button } from '@/ui/Button';

const HomeScreen = (): ReactElement => {
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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Stack.Screen options={screenOptions} />
      {hasToken ? (
        <BalancesContent onChangeToken={openToken} />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.title}>{strings.home.emptyTitle}</Text>
          <Text style={styles.text}>{strings.home.emptyText}</Text>
          <Button testID="add-token" title={strings.home.addTokenButton} onPress={openToken} />
        </View>
      )}
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: spacing.md },
  empty: { gap: spacing.md, marginTop: spacing.lg },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: colors.text },
  text: { fontSize: fontSize.body, color: colors.muted },
  headerButton: { paddingHorizontal: spacing.md },
  headerButtonText: { color: colors.primary, fontSize: fontSize.md, fontWeight: fontWeight.semibold },
});
