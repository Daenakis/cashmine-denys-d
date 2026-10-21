export type TokenContextValue = {
  token: string | null;
  setToken: (value: string) => void;
  clearToken: () => void;
};
