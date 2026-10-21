import { create } from 'zustand';

import type { TokenState } from '@/types/token';

import { readStoredToken, writeStoredToken } from './tokenStorage';

// The API token entered by the user. Persisted to localStorage by hand (not zustand/persist)
// so storage errors in private mode are swallowed by tokenStorage and the app keeps working in memory.
export const useTokenStore = create<TokenState>()((set) => ({
  token: readStoredToken(),
  setToken: (value: string) => {
    const token: string = value.trim();
    writeStoredToken(token);
    set({ token });
  },
  clearToken: () => {
    writeStoredToken(null);
    set({ token: null });
  },
}));

export const selectToken = (state: TokenState): string | null => state.token;

export const selectSetToken = (state: TokenState): TokenState['setToken'] => state.setToken;

export const selectClearToken = (state: TokenState): TokenState['clearToken'] => state.clearToken;
