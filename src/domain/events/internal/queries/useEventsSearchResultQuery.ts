import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from 'domain/constants';
import { useMemo } from 'react';
import { TableSortBy } from 'components/Table';
import { useEventsListQuery } from '../../service/queries/useEventsListQuery';
import { mapFiltersToEventsAdvancedFilters } from '../transformers/mapFiltersToEventsAdvancedFilters';
import { mapTableSortByToEventSortFields } from '../transformers/mapTableSortByToEventSortFields';
import { InternalEventsFilters } from '../types';
// import { useEventsSearchQueryMetadataKeysQuery } from './useEventsMetadataKeysQuery';
import { mapInternalFilterToEventsFilter } from '../transformers/mapInternalFilterToEventsFilter';
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
  // const searchQueryMetadataKeys = useEventsSearchQueryMetadataKeysQuery(
  //   query,
  //   eventsFilters
  // );

  const filter = useMemo(
    () => mapInternalFilterToEventsFilter(eventsFilters),
    [eventsFilters]
  );

  const advancedFilter = useMemo(
    () =>
      mapFiltersToEventsAdvancedFilters(
        eventsFilters,
        // searchQueryMetadataKeys,
        query
      ),
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
