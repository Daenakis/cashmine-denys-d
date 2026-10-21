import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { type ReactElement, useState } from 'react';

import { createAppQueryClient } from '@/api/queryClient';
import { RootStack } from '@/navigation/RootStack';
import { TokenProvider } from '@/token/TokenProvider';

const RootLayout = (): ReactElement => {
  const [queryClient] = useState(createAppQueryClient);

  return (
    <TokenProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <RootStack />
      </QueryClientProvider>
    </TokenProvider>
  );
};

export default RootLayout;
