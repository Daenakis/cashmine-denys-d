import { type ReactElement, type ReactNode, createContext, useCallback, useMemo, useState } from 'react';

import { readStoredToken, writeStoredToken } from './tokenStorage';

export type TokenContextValue = {
  token: string | null;
  setToken: (value: string) => void;
  clearToken: () => void;
};

export const TokenContext = createContext<TokenContextValue | null>(null);

type Props = { children: ReactNode };

export function TokenProvider({ children }: Props): ReactElement {
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
}
