import { Stack } from 'expo-router';
import type { ReactElement } from 'react';
import { StyleSheet } from 'react-native';

import { useTokenScopedCache } from '@/api/useTokenScopedCache';
import { colors, fontWeight } from '@/constants/theme';
import { strings } from '@/i18n/strings';

export const RootStack = (): ReactElement => {
  useTokenScopedCache();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={homeOptions} />
      <Stack.Screen name="token" options={tokenOptions} />
    </Stack>
  );
};

const styles = StyleSheet.create({
  content: { backgroundColor: colors.background },
  headerTitle: { fontWeight: fontWeight.semibold },
});

const screenOptions = {
  contentStyle: styles.content,
  headerTitleStyle: styles.headerTitle,
};

const homeOptions: { title: string } = { title: strings.appName };

const tokenOptions = { title: strings.token.title, presentation: 'modal' } as const;
