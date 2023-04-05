import { useSDK } from '@cognite/sdk-provider';
import {
  getEventsAggregateCount,
  queryKeys,
} from '@data-exploration-lib/domain-layer';
import { useQuery, UseQueryOptions } from 'react-query';

import {
  mapFiltersToEventsAdvancedFilters,
  mapInternalFilterToEventsFilter,
} from '@data-exploration-lib/domain-layer';
import { useMemo } from 'react';
import {
  EventConfigType,
  InternalEventsFilters,
} from '@data-exploration-lib/core';

export const useEventsAggregateCountQuery = (
  {
    query,
    eventsFilters,
  }: {
    query?: string;
    eventsFilters: InternalEventsFilters;
  },
  options?: UseQueryOptions,
  searchConfig?: EventConfigType
) => {
  const sdk = useSDK();

  const advancedFilter = useMemo(
    () => mapFiltersToEventsAdvancedFilters(eventsFilters, query, searchConfig),
    [eventsFilters, query, searchConfig]
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
