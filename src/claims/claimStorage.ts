import { CLAIMS_STORAGE_KEY } from '@/constants/storage';
import type { ClaimsState } from '@/types/claimTracking';

export const EMPTY_CLAIMS_STATE: ClaimsState = { attempts: {}, claims: [] };

export function readStoredClaims(): ClaimsState {
  try {
    const raw: string | null = globalThis.localStorage?.getItem(CLAIMS_STORAGE_KEY) ?? null;
    if (!raw) return EMPTY_CLAIMS_STATE;
    const parsed = JSON.parse(raw) as Partial<ClaimsState>;
    return { attempts: parsed.attempts ?? {}, claims: parsed.claims ?? [] };
  } catch {
    return EMPTY_CLAIMS_STATE;
  }
}

export function writeStoredClaims(state: ClaimsState) {
  try {
    globalThis.localStorage?.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Tracking still works in memory for this session.
  }
}
