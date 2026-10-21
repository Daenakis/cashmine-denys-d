import { type ReactElement, useCallback, useMemo, useState } from 'react';

import type { TokenContextValue } from '@/types/token';

import { TokenContext } from '../TokenContext';
import { readStoredToken, writeStoredToken } from '../tokenStorage';
import type { TokenProviderProps } from './types';

export const TokenProvider = ({ children }: TokenProviderProps): ReactElement => {
  const [token, setTokenState] = useState<string | null>(readStoredToken);

  const setToken = useCallback((value: string): void => {
    const trimmed: string = value.trim();
    writeStoredToken(trimmed);
    setTokenState(trimmed);
  }, []);

  const clearToken = useCallback((): void => {
    writeStoredToken(null);
    setTokenState(null);
  }, []);

  const value: TokenContextValue = useMemo(
    (): TokenContextValue => ({ token, setToken, clearToken }),
    [token, setToken, clearToken],
  );

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
};
