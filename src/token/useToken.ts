import { useContext } from 'react';

import type { TokenContextValue } from '@/types/token';

import { TokenContext } from './TokenContext';

export function useToken(): TokenContextValue {
  const context: TokenContextValue | null = useContext(TokenContext);
  if (context === null) throw new Error('useToken must be used inside TokenProvider');
  return context;
}
