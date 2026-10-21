import type { AssetClaimStatus } from '@/types/claimTracking';

export type ClaimStatusBannerProps = {
  asset: string;
  decimals: number;
  status: AssetClaimStatus;
  onViewClaim: (id: string) => void;
  onDismiss: (id: string) => void;
  onCheckAgain: (asset: string) => void;
};
