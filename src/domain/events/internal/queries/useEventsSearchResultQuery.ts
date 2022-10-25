import { useMemo } from 'react';
import { useEventsListQuery } from '../../service/queries/useEventsListQuery';
import { mapFiltersToEventsAdvancedFilters } from '../transformers/mapFiltersToEventsAdvancedFilters';
import { InternalEventsFilters } from '../types';
import { useEventsSearchQueryMetadataKeysQuery } from './useEventsMetadataKeysQuery';

export const useEventsSearchResultQuery = ({
  query,
  eventsFilters,
}: {
  query?: string;
  eventsFilters: InternalEventsFilters;
}) => {
  const searchQueryMetadataKeys = useEventsSearchQueryMetadataKeysQuery(
    query,
    eventsFilters
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

  return useEventsListQuery({ advancedFilter, limit: 25 });
};
