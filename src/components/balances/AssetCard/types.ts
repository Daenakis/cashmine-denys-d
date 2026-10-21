import type { BalanceItem } from '@/api/balances';
import type { AssetClaimStatus } from '@/types/claimTracking';

export type AssetCardProps = {
  item: BalanceItem;
  claimStatus: AssetClaimStatus;
  claimBlocked: boolean;
  onClaim: (asset: string) => void;
  onViewClaim: (id: string) => void;
  onDismissClaim: (id: string) => void;
  onCheckAgain: (asset: string) => void;
};
