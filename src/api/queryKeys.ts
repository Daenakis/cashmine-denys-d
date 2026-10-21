export const queryKeys = {
  balances: ['balances'] as const,
  claimOptions: (asset: string): readonly ['claim-options', string] => ['claim-options', asset] as const,
  claim: (id: string): readonly ['claim', string] => ['claim', id] as const,
  activity: (limit: number): readonly ['activity', number] => ['activity', limit] as const,
};
