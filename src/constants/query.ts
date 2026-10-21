// Server recomputes the balances snapshot every 15 s.
export const BALANCES_REFRESH_MS: number = 15_000;

// A pending claim settles in about 20 s.
export const CLAIM_POLL_MS: number = 2_000;

export const CREATE_CLAIM_MAX_RETRIES: number = 5;

export const MAX_QUERY_RETRIES: number = 3;

// API allows 1..20.
export const ACTIVITY_PAGE_SIZE: number = 20;

export const RETRY_BASE_DELAY_MS: number = 1_000;

export const RETRY_MAX_DELAY_MS: number = 8_000;
