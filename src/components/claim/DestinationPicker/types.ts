import type { ClaimOptions } from '@/api/claimOptions';

export type Destination = ClaimOptions['destinations'][number];

export type DestinationPickerProps = {
  destinations: readonly Destination[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
};
