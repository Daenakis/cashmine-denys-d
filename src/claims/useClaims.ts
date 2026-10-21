import { useContext } from 'react';

import type { ClaimsContextValue } from '@/types/claimTracking';

import { ClaimsContext } from './ClaimsContext';

export function useClaims(): ClaimsContextValue {
  const context: ClaimsContextValue | null = useContext(ClaimsContext);
  if (context === null) throw new Error('useClaims must be used inside ClaimsProvider');
  return context;
}
