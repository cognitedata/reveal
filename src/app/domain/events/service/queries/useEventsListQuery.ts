import { useSDK } from '@cognite/sdk-provider';
import { AdvancedFilter } from 'app/domain/builders';
import { EventsProperties } from 'app/domain/events/internal/transformers/mapFiltersToEventsAdvancedFilters';

import { queryKeys } from 'app/domain/queryKeys';
import { useMemo } from 'react';
import { useInfiniteQuery, UseInfiniteQueryOptions } from 'react-query';
import { getEventsList } from '../network/getEventsList';

export const useEventsListQuery = (
  {
    advancedFilter,
    limit,
  }: {
    advancedFilter?: AdvancedFilter<EventsProperties>;
    limit?: number;
  } = {},
  options?: UseInfiniteQueryOptions
) => {
  const sdk = useSDK();

  const { data, ...rest } = useInfiniteQuery(
    queryKeys.listEvents([advancedFilter, limit]),
    ({ pageParam }) => {
      return getEventsList(sdk, { cursor: pageParam, advancedFilter, limit });
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
