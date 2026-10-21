// The API token lives in browser storage only; it is never bundled into the build.
// Storage access can throw (private mode, blocked site data), so every call is guarded
// and the app keeps working with the in-memory value from TokenProvider.

const STORAGE_KEY: string = 'cashmine.apiToken';

export function readStoredToken(): string | null {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function writeStoredToken(value: string | null): void {
  try {
    if (value === null) globalThis.localStorage?.removeItem(STORAGE_KEY);
    else globalThis.localStorage?.setItem(STORAGE_KEY, value);
  } catch {
    // The token just won't survive a reload.
  }
}

export function maskToken(token: string): string {
  return token.length <= 4 ? '••••' : `••••${token.slice(-4)}`;
}
