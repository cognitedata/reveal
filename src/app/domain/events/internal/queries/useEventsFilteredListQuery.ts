import { useEventsSearchQueryMetadataKeysQuery } from 'app/domain/events/internal/queries/useEventsMetadataKeysQuery';
import { mapFiltersToEventsAdvancedFilters } from 'app/domain/events/internal/transformers/mapFiltersToEventsAdvancedFilters';
import { useEventsFilters } from 'app/store';
import { useMemo } from 'react';
import { useEventsListQuery } from '../../service/queries/useEventsListQuery';

export const useEventsFilteredListQuery = () => {
  const [eventsFilters] = useEventsFilters();

  const searchQueryMetadataKeys = useEventsSearchQueryMetadataKeysQuery();

  const advancedFilter = useMemo(
    () =>
      mapFiltersToEventsAdvancedFilters(eventsFilters, searchQueryMetadataKeys),
    [eventsFilters, searchQueryMetadataKeys]
  );

  return useEventsListQuery({ advancedFilter, limit: 25 });
};
