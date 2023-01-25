import { useSDK } from '@cognite/sdk-provider';
import {
  getEventsAggregateCount,
  queryKeys,
} from '@data-exploration-lib/domain-layer';
import { useQuery, UseQueryOptions } from 'react-query';

import {
  InternalEventsFilters,
  mapFiltersToEventsAdvancedFilters,
  mapInternalFilterToEventsFilter,
} from '@data-exploration-lib/domain-layer';
import { useMemo } from 'react';

export const useEventsAggregateCountQuery = (
  {
    query,
    eventsFilters,
  }: {
    query?: string;
    eventsFilters: InternalEventsFilters;
  },

  options?: UseQueryOptions
) => {
  const sdk = useSDK();

  const advancedFilter = useMemo(
    () => mapFiltersToEventsAdvancedFilters(eventsFilters, query),
    [eventsFilters, query]
  );

  const filter = useMemo(
    () => mapInternalFilterToEventsFilter(eventsFilters),
    [eventsFilters]
  );

  return useQuery(
    queryKeys.aggregateEvents([advancedFilter, filter, 'count']),
    () => {
      return getEventsAggregateCount(sdk, {
        filter,
        advancedFilter,
      });
    },
    {
      ...(options as any),
    }
  );
};
