export type ErrorStateAction = { title: string; onPress: () => void };

export type ErrorStateProps = {
  title: string;
  message: string;
  onRetry: () => void;
  retrying?: boolean;
  secondaryAction?: ErrorStateAction;
};
