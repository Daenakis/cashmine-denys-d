import { z } from 'zod';

import { DECIMAL_STRING_REGEX, SIGNED_DECIMAL_STRING_REGEX } from '@/constants/regex';

export const decimalString = z.string().regex(DECIMAL_STRING_REGEX, 'Invalid decimal string');

export const signedDecimalString = z.string().regex(SIGNED_DECIMAL_STRING_REGEX, 'Invalid decimal string');

export const isoDateTime = z.iso.datetime({ offset: true });

export const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    field: z.string().optional(),
    retryAfterMs: z.number().optional(),
  }),
});
