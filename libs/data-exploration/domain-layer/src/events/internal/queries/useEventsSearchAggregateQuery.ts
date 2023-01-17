import { useMemo } from 'react';
import {
  InternalEventsFilters,
  mapFiltersToEventsAdvancedFilters,
  mapInternalFilterToEventsFilter,
  useEventsAggregateQuery,
} from '@data-exploration-lib/domain-layer';
import { UseQueryOptions } from 'react-query';

export const useEventsSearchAggregateQuery = (
  {
    query,
    eventsFilters,
  }: {
    query?: string;
    eventsFilters: InternalEventsFilters;
  },
  options?: UseQueryOptions
) => {
  const advancedFilter = useMemo(
    () => mapFiltersToEventsAdvancedFilters(eventsFilters, query),
    [eventsFilters, query]
  );

  const filter = useMemo(
    () => mapInternalFilterToEventsFilter(eventsFilters),
    [eventsFilters]
  );

  return useEventsAggregateQuery(
    {
      filter,
      advancedFilter,
    },
    { ...options, keepPreviousData: true }
  );
};
