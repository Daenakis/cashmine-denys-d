export type DestinationOptionProps = {
  id: string;
  label: string;
  selected: boolean;
  disabled: boolean;
  onSelect: (id: string) => void;
};
