import { Stack, useLocalSearchParams } from 'expo-router';
import { type ReactElement, useMemo } from 'react';

import { ClaimForm } from '@/components/claim/ClaimForm';
import { strings } from '@/i18n/strings';

const ClaimScreen = (): ReactElement => {
  const { asset = '' } = useLocalSearchParams<{ asset: string }>();
  const options = useMemo(() => ({ title: strings.claim.title(asset) }), [asset]);

  return (
    <>
      <Stack.Screen options={options} />
      <ClaimForm asset={asset} />
    </>
  );
};

export default ClaimScreen;
