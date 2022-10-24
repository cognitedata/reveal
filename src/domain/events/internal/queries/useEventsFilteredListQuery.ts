import { useMemo } from 'react';
import { useEventsListQuery } from '../../service/queries/useEventsListQuery';
import { mapFiltersToEventsAdvancedFilters } from '../transformers/mapFiltersToEventsAdvancedFilters';
import { InternalEventsFilters } from '../types';
import { useEventsSearchQueryMetadataKeysQuery } from './useEventsMetadataKeysQuery';

export const useEventsFilteredListQuery = ({
  query,
  eventsFilters,
}: {
  query?: string;
  eventsFilters: InternalEventsFilters;
}) => {
  // const [eventsFilters] = useEventsFilters();

  const searchQueryMetadataKeys = useEventsSearchQueryMetadataKeysQuery(query);

  const advancedFilter = useMemo(
    () =>
      mapFiltersToEventsAdvancedFilters(eventsFilters, searchQueryMetadataKeys),
    [eventsFilters, searchQueryMetadataKeys]
  );

  return useEventsListQuery({ advancedFilter, limit: 25 });
};
