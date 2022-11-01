import { useSDK } from '@cognite/sdk-provider';
import { AdvancedFilter } from 'domain/builders';
import { EventsProperties } from 'domain/events/internal/transformers/mapFiltersToEventsAdvancedFilters';
import { queryKeys } from 'domain/queryKeys';
import { InternalSortBy } from 'domain/types';
import { useMemo } from 'react';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { getEventsList } from '../network/getEventsList';

export const useEventsListQuery = (
  {
    advancedFilter,
    limit,
    sort,
  }: {
    advancedFilter?: AdvancedFilter<EventsProperties>;
    limit?: number;
    sort?: InternalSortBy[];
  } = {},
  options?: UseInfiniteQueryOptions
) => {
  const sdk = useSDK();

  const { data, ...rest } = useInfiniteQuery(
    queryKeys.listEvents([advancedFilter, limit, sort]),
    ({ pageParam }) => {
      return getEventsList(sdk, {
        cursor: pageParam,
        advancedFilter,
        sort,
        limit,
      });
    },
    {
      getNextPageParam: param => param.nextCursor,
      ...(options as any),
    }
  );

  const flattenData = useMemo(
    () => (data?.pages || []).flatMap(({ items }) => items),
    [data?.pages]
  );

  return { data: flattenData, ...rest };
};
