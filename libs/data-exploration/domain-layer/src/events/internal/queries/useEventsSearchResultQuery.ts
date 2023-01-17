import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from '@data-exploration-lib/domain-layer';
import { useMemo } from 'react';
import { TableSortBy } from '@data-exploration-lib/domain-layer';
import { useEventsListQuery } from '../../service';
import { mapFiltersToEventsAdvancedFilters } from '../transformers';
import { mapTableSortByToEventSortFields } from '../transformers';
import { InternalEventsFilters } from '../types';
import { mapInternalFilterToEventsFilter } from '../transformers';
import { UseInfiniteQueryOptions } from 'react-query';

export const useEventsSearchResultQuery = (
  {
    query,
    eventsFilters,
    eventsSortBy,
  }: {
    query?: string;
    eventsFilters: InternalEventsFilters;
    eventsSortBy?: TableSortBy[];
  },
  options?: UseInfiniteQueryOptions
) => {
  const filter = useMemo(
    () => mapInternalFilterToEventsFilter(eventsFilters),
    [eventsFilters]
  );

  const advancedFilter = useMemo(
    () => mapFiltersToEventsAdvancedFilters(eventsFilters, query),
    [eventsFilters, query]
  );

  const sort = useMemo(
    () => mapTableSortByToEventSortFields(eventsSortBy),
    [eventsSortBy]
  );

  return useEventsListQuery(
    {
      filter,
      advancedFilter,
      sort,
      limit: DEFAULT_GLOBAL_TABLE_RESULT_LIMIT,
    },
    {
      ...options,
      keepPreviousData: true,
    }
  );
};
