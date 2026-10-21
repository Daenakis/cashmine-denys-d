import { useLocalSearchParams } from 'expo-router';
import type { ReactElement } from 'react';

import { ClaimDetails } from '@/components/claim/ClaimDetails';

const ClaimStatusScreen = (): ReactElement => {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  return <ClaimDetails id={id} />;
};

export default ClaimStatusScreen;
