import { type InfiniteData, type UseInfiniteQueryResult, useInfiniteQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { useToken } from '@/token/useToken';

import { request, unwrap } from './client';
import type { ApiError, Result } from './errors';
import { queryKeys } from './queryKeys';
import { isoDateTime, signedDecimalString } from './schemas';

export const ACTIVITY_PAGE_SIZE: number = 20;

const activityBase = {
  id: z.string(),
  asset: z.string(),
  amount: signedDecimalString,
  createdAt: isoDateTime,
};

export const activityItemSchema = z.discriminatedUnion('type', [
  z.object({
    ...activityBase,
    type: z.literal('accrual'),
    status: z.enum(['pending', 'confirmed']),
    exchange: z.string(),
    relatedId: z.null(),
  }),
  z.object({
    ...activityBase,
    type: z.literal('reversal'),
    status: z.literal('confirmed'),
    exchange: z.string(),
    relatedId: z.string(),
  }),
  z.object({
    ...activityBase,
    type: z.literal('claim'),
    status: z.enum(['pending', 'completed', 'failed']),
    exchange: z.null(),
    relatedId: z.string().nullable(),
  }),
]);

export const activityPageSchema = z.object({
  items: z.array(activityItemSchema),
  nextCursor: z.string().nullable(),
});

export type ActivityItem = z.infer<typeof activityItemSchema>;
export type ActivityPage = z.infer<typeof activityPageSchema>;

export function fetchActivity(
  token: string | null,
  cursor: string | null,
  limit: number,
  signal?: AbortSignal,
): Promise<Result<ActivityPage>> {
  const params: URLSearchParams = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);
  return request({ token, path: `/v1/activity?${params.toString()}`, schema: activityPageSchema, signal });
}

export function useActivity(
  limit: number = ACTIVITY_PAGE_SIZE,
): UseInfiniteQueryResult<InfiniteData<ActivityPage, string | null>, ApiError> {
  const { token } = useToken();
  return useInfiniteQuery<ActivityPage, ApiError, InfiniteData<ActivityPage, string | null>, readonly unknown[], string | null>({
    queryKey: queryKeys.activity(limit),
    queryFn: async ({ pageParam, signal }): Promise<ActivityPage> => unwrap(await fetchActivity(token, pageParam, limit, signal)),
    initialPageParam: null,
    getNextPageParam: (lastPage: ActivityPage): string | null => lastPage.nextCursor,
    enabled: token !== null,
  });
}
