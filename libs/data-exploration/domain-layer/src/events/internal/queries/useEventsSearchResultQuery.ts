import { useMemo } from 'react';
import { UseInfiniteQueryOptions } from '@tanstack/react-query';
import {
  EventConfigType,
  InternalEventsFilters,
} from '@data-exploration-lib/core';
import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from '../../../constants';
import { TableSortBy } from '../../../types';

import { useEventsListQuery } from '../../service';
import {
  mapFiltersToEventsAdvancedFilters,
  mapTableSortByToEventSortFields,
  mapInternalFilterToEventsFilter,
} from '../transformers';

export const useEventsSearchResultQuery = (
  {
    query,
    eventsFilters,
    eventsSortBy,
    limit,
  }: {
    query?: string;
    eventsFilters: InternalEventsFilters;
    eventsSortBy?: TableSortBy[];
    limit?: number;
  },
  searchConfig?: EventConfigType,
  options?: UseInfiniteQueryOptions
) => {
  const filter = useMemo(
    () => mapInternalFilterToEventsFilter(eventsFilters),
    [eventsFilters]
  );

  const advancedFilter = useMemo(
    () => mapFiltersToEventsAdvancedFilters(eventsFilters, query, searchConfig),
    [eventsFilters, query, searchConfig]
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
      limit: limit ?? DEFAULT_GLOBAL_TABLE_RESULT_LIMIT,
    },
    {
      ...options,
      keepPreviousData: true,
    }
  );
};
