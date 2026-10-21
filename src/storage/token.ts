import { useSyncExternalStore } from 'react';

// The API token is entered by the user and kept in browser storage only.
// It is never bundled into the build. Storage access can throw (private mode,
// blocked site data), so every read/write is guarded and we fall back to memory.

const STORAGE_KEY = 'cashmine.apiToken';

let memoryToken: string | null = readFromStorage();
const listeners = new Set<() => void>();

function readFromStorage(): string | null {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

function writeToStorage(value: string | null): void {
  try {
    if (value === null) globalThis.localStorage?.removeItem(STORAGE_KEY);
    else globalThis.localStorage?.setItem(STORAGE_KEY, value);
  } catch {
    // Keep the in-memory value; the token just won't survive a reload.
  }
}

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function getToken(): string | null {
  return memoryToken;
}

export function setToken(value: string): void {
  memoryToken = value.trim();
  writeToStorage(memoryToken);
  emit();
}

export function clearToken(): void {
  memoryToken = null;
  writeToStorage(null);
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useToken(): string | null {
  return useSyncExternalStore(subscribe, getToken, () => null);
}

export function maskToken(token: string): string {
  return token.length <= 4 ? '••••' : `••••${token.slice(-4)}`;
}
