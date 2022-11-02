import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from 'domain/constants';
import { useMemo } from 'react';
import { TableSortBy } from 'components/ReactTable/V2';
import { useEventsListQuery } from '../../service/queries/useEventsListQuery';
import { mapFiltersToEventsAdvancedFilters } from '../transformers/mapFiltersToEventsAdvancedFilters';
import { mapTableSortByToEventSortFields } from '../transformers/mapTableSortByToEventSortFields';
import { InternalEventsFilters } from '../types';
import { useEventsSearchQueryMetadataKeysQuery } from './useEventsMetadataKeysQuery';
import { mapInternalFilterToEventsFilter } from '../transformers/mapInternalFilterToEventsFilter';

export const useEventsSearchResultQuery = ({
  query,
  eventsFilters,
  eventsSortBy,
}: {
  query?: string;
  eventsFilters: InternalEventsFilters;
  eventsSortBy: TableSortBy[];
}) => {
  const searchQueryMetadataKeys = useEventsSearchQueryMetadataKeysQuery(
    query,
    eventsFilters
  );

  const filter = useMemo(
    () => mapInternalFilterToEventsFilter(eventsFilters),
    [eventsFilters]
  );

  const advancedFilter = useMemo(
    () =>
      mapFiltersToEventsAdvancedFilters(
        eventsFilters,
        searchQueryMetadataKeys,
        query
      ),
    [eventsFilters, searchQueryMetadataKeys, query]
  );

  const sort = useMemo(
    () => mapTableSortByToEventSortFields(eventsSortBy),
    [eventsSortBy]
  );

  return useEventsListQuery({
    filter,
    advancedFilter,
    sort,
    limit: DEFAULT_GLOBAL_TABLE_RESULT_LIMIT,
  });
};
