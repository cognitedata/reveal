import { mapFiltersToEventsAdvancedFilters } from 'app/domain/events/internal/transformers/mapFiltersToEventsAdvancedFilters';
import { useEventsFilters } from 'app/store';
import { useEventsListQuery } from '../../service/queries/useEventsListQuery';

export const useEventsFilteredListQuery = () => {
  const [eventsFilters] = useEventsFilters();

  const advancedFilters = mapFiltersToEventsAdvancedFilters(eventsFilters);

  return useEventsListQuery(advancedFilters);
};
