import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { type ReactElement, useState } from 'react';

import { createAppQueryClient } from '@/api/queryClient';
import { ClaimsProvider } from '@/claims/ClaimsProvider';
import { RootStack } from '@/navigation/RootStack';

const RootLayout = (): ReactElement => {
  const [queryClient] = useState(createAppQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <ClaimsProvider>
        <RootStack />
      </ClaimsProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
