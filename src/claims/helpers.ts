import type { Claim, ClaimStatus } from '@/api/claims';
import { strings } from '@/i18n/strings';
import type { ClaimAmountError } from '@/types/claim';
import type { AssetClaimStatus, ClaimsState, TrackedClaim } from '@/types/claimTracking';

export function toTrackedClaim(claim: Claim): TrackedClaim {
  return {
    id: claim.id,
    asset: claim.asset,
    amount: claim.amount,
    status: claim.status,
    failureReason: claim.failureReason,
    createdAt: claim.createdAt,
    updatedAt: claim.updatedAt,
    dismissed: false,
  };
}

export function isTerminal(claim: TrackedClaim): boolean {
  return claim.status !== 'pending';
}

// Both timestamps come from the server, so client clock skew doesn't matter.
// Assumption (see NOTES.md): a snapshot with asOf >= t includes every change made before t.
export function isReflectedInSnapshot(claim: TrackedClaim, asOf: string | undefined): boolean {
  if (!asOf) return false;
  const reference: string = isTerminal(claim) ? claim.updatedAt : claim.createdAt;
  return Date.parse(asOf) >= Date.parse(reference);
}

export function getAssetClaimStatus(state: ClaimsState, asset: string, asOf: string | undefined): AssetClaimStatus {
  const attempt = state.attempts[asset];
  if (attempt) return { kind: attempt.status };

  const latest: TrackedClaim | undefined = [...state.claims]
    .filter((claim: TrackedClaim): boolean => claim.asset === asset)
    .sort((a: TrackedClaim, b: TrackedClaim): number => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
  if (!latest) return { kind: 'none' };

  const reflected: boolean = isReflectedInSnapshot(latest, asOf);
  if (latest.status === 'pending') return { kind: 'pending', claim: latest, syncing: !reflected };
  if (!reflected) return { kind: 'syncing', claim: latest };
  if (latest.status === 'failed' && !latest.dismissed) return { kind: 'failed', claim: latest };
  return { kind: 'none' };
}

// New claims for an asset are blocked until the previous one settled AND the snapshot shows it.
export function isClaimBlocked(status: AssetClaimStatus): boolean {
  return status.kind !== 'none' && status.kind !== 'failed';
}

// Drop claims that are settled, visible in the snapshot and need no more attention.
export function pruneClaims(claims: readonly TrackedClaim[], asOf: string | undefined): TrackedClaim[] {
  return claims.filter(
    (claim: TrackedClaim): boolean =>
      !(isTerminal(claim) && isReflectedInSnapshot(claim, asOf) && (claim.status === 'completed' || claim.dismissed)),
  );
}

export function getClaimAmountErrorMessage(error: ClaimAmountError, asset: string): string {
  switch (error.kind) {
    case 'empty':
      return strings.claim.errors.empty;
    case 'format':
      return strings.claim.errors.format;
    case 'tooManyDecimals':
      return strings.claim.errors.tooManyDecimals(error.decimals);
    case 'belowMin':
      return strings.claim.errors.belowMin(error.minAmount, asset);
    case 'aboveAvailable':
      return strings.claim.errors.aboveAvailable(error.available, asset);
    case 'notAboveFee':
      return strings.claim.errors.notAboveFee(error.fee, asset);
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve: () => void) => {
    setTimeout(resolve, ms);
  });
}

export function getClaimStatusLabel(status: ClaimStatus): string {
  switch (status) {
    case 'pending':
      return strings.claimStatus.pending;
    case 'completed':
      return strings.claimStatus.completed;
    case 'failed':
      return strings.claimStatus.failed;
  }
}
