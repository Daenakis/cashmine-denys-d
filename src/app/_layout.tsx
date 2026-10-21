import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type ReactElement, useState } from 'react';
import { StyleSheet } from 'react-native';

import { createAppQueryClient } from '@/api/queryClient';
import { useTokenScopedCache } from '@/api/useTokenScopedCache';
import { strings } from '@/i18n/strings';
import { TokenProvider } from '@/token/TokenContext';
import { colors } from '@/ui/theme';

export default function RootLayout(): ReactElement {
  const [queryClient] = useState(createAppQueryClient);

  return (
    <TokenProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <RootStack />
      </QueryClientProvider>
    </TokenProvider>
  );
}

function RootStack(): ReactElement {
  useTokenScopedCache();

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" options={homeOptions} />
      <Stack.Screen name="token" options={tokenOptions} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  content: { backgroundColor: colors.background },
  headerTitle: { fontWeight: '600' },
});

const screenOptions = {
  contentStyle: styles.content,
  headerTitleStyle: styles.headerTitle,
};

const homeOptions: { title: string } = { title: strings.appName };

const tokenOptions = { title: strings.token.title, presentation: 'modal' } as const;
