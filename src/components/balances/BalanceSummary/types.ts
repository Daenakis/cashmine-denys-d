export type BalanceSummaryProps = {
  total: string;
  availableTotal: string;
  age: string;
  stale: boolean;
  refreshFailed: boolean;
  refreshing: boolean;
  onRefresh: () => void;
};
