import { createContext } from 'react';

import type { ClaimsContextValue } from '@/types/claimTracking';

export const ClaimsContext = createContext<ClaimsContextValue | null>(null);
