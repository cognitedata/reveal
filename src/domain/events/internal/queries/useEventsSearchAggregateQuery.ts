import { useMemo } from 'react';
import {
  InternalEventsFilters,
  mapFiltersToEventsAdvancedFilters,
  mapInternalFilterToEventsFilter,
  // useEventsSearchQueryMetadataKeysQuery,
  useEventsAggregateQuery,
} from 'domain/events';

export const useEventsSearchAggregateQuery = ({
  query,
  eventsFilters,
}: {
  query?: string;
  eventsFilters: InternalEventsFilters;
}) => {
  // const searchQueryMetadataKeys = useEventsSearchQueryMetadataKeysQuery(
  //   query,
  //   eventsFilters
  // );

  const advancedFilter = useMemo(
    () =>
      mapFiltersToEventsAdvancedFilters(
        eventsFilters,
        // searchQueryMetadataKeys,
        query
      ),
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
    { keepPreviousData: true }
  );
};
