import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { strings } from '@/i18n/strings';
import { colors } from '@/ui/theme';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="index" options={homeOptions} />
        <Stack.Screen name="token" options={tokenOptions} />
      </Stack>
    </QueryClientProvider>
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

const homeOptions = { title: strings.appName };

const tokenOptions = { title: strings.token.title, presentation: 'modal' } as const;
