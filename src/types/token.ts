export type TokenState = {
  token: string | null;
  setToken: (value: string) => void;
  clearToken: () => void;
};
