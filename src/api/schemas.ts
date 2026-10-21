import { z } from 'zod';

// Decimal strings as the API defines them: digits, optional dot + digits, no leading zeros.
export const decimalString = z.string().regex(/^(0|[1-9]\d*)(\.\d+)?$/, 'Invalid decimal string');

// Activity amounts are signed (negative for reversals and claims).
export const signedDecimalString = z.string().regex(/^-?(0|[1-9]\d*)(\.\d+)?$/, 'Invalid decimal string');

export const isoDateTime = z.iso.datetime({ offset: true });

export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    field: z.string().optional(),
    retryAfterMs: z.number().optional(),
  }),
});
