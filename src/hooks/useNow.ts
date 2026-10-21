import { useEffect, useState } from 'react';

import { NOW_TICK_MS } from '@/constants/time';

// Current time that re-renders the caller every tick, for relative timestamps.
export function useNow(tickMs: number = NOW_TICK_MS): number {
  const [now, setNow] = useState<number>(Date.now);

  useEffect((): (() => void) => {
    const id: ReturnType<typeof setInterval> = setInterval((): void => setNow(Date.now()), tickMs);
    return (): void => clearInterval(id);
  }, [tickMs]);

  return now;
}
