import type { Claim, ClaimStatus } from '@/api/claims';
import type { ApiError } from './apiError';

export type ClaimRequestBody = {
  asset: string;
  amount: string;
  destinationId: string;
};

// A confirmed submission whose outcome we don't know yet. Persisted before the POST
// so a reload retries with the same Idempotency-Key instead of creating a new claim.
export type ClaimAttempt = ClaimRequestBody & {
  idempotencyKey: string;
  status: 'submitting' | 'unknown';
};

// A claim the server confirmed (201 or idempotent replay). Server timestamps only.
export type TrackedClaim = {
  id: string;
  asset: string;
  amount: string;
  status: ClaimStatus;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  dismissed: boolean;
};

export type ClaimsState = {
  attempts: Record<string, ClaimAttempt>;
  claims: TrackedClaim[];
};

export type SubmitOutcome =
  | { kind: 'created'; claim: Claim }
  | { kind: 'rejected'; error: ApiError }
  | { kind: 'unknown'; error: ApiError }
  | { kind: 'busy' };

// What the UI shows for one asset. Derived from claim statuses and snapshot time only;
// balances themselves always come from the server snapshot.
export type AssetClaimStatus =
  | { kind: 'none' }
  | { kind: 'submitting' }
  | { kind: 'unknown' }
  | { kind: 'pending'; claim: TrackedClaim; syncing: boolean }
  | { kind: 'syncing'; claim: TrackedClaim }
  | { kind: 'failed'; claim: TrackedClaim };

export type ClaimsContextValue = {
  state: ClaimsState;
  startAndSubmit: (body: ClaimRequestBody) => Promise<SubmitOutcome>;
  retryAttempt: (asset: string) => Promise<SubmitOutcome>;
  dismissClaim: (id: string) => void;
  getAssetStatus: (asset: string) => AssetClaimStatus;
};

export type ClaimFormStep = 'edit' | 'review';

export type ClaimFormView =
  | { kind: 'loading' }
  | { kind: 'error'; message: string; retrying: boolean }
  | { kind: 'notFound' }
  | { kind: 'unknown' }
  | { kind: 'blocked'; claimId: string | null }
  | { kind: 'cannotClaim'; minAmount: string }
  | { kind: 'form'; step: ClaimFormStep };
