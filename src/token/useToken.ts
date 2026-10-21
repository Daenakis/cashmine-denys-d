import { useContext } from 'react';

import { TokenContext, type TokenContextValue } from './TokenContext';

export function useToken(): TokenContextValue {
  const context: TokenContextValue | null = useContext(TokenContext);
  if (context === null) throw new Error('useToken must be used inside TokenProvider');
  return context;
}
