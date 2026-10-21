import { createContext } from 'react';

import type { TokenContextValue } from '@/types/token';

export const TokenContext = createContext<TokenContextValue | null>(null);
