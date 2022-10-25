import { useEventsListQuery } from 'domain/events/service/queries/useEventsListQuery';
import { isEmpty } from 'lodash';
import { useMemo } from 'react';
import { mapEventsMetadataKeysWithQuery } from '../transformers/mapEventsMetadataKeysWithQuery';
import { mapFiltersToEventsAdvancedFilters } from '../transformers/mapFiltersToEventsAdvancedFilters';
import { InternalEventsFilters } from '../types';

export const useEventsSearchQueryMetadataKeysQuery = (
  query: string | undefined,
  eventsFilters: InternalEventsFilters
) => {
  const advancedFilter = useMemo(
    () => mapFiltersToEventsAdvancedFilters(eventsFilters),
    [eventsFilters]
  );

  const { data } = useEventsListQuery(
    { advancedFilter },
    { enabled: !isEmpty(query) }
  );

  return useMemo(
    () => mapEventsMetadataKeysWithQuery(data, query),
    [data, query]
  );
};
