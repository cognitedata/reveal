import { useEventsListQuery } from '@data-exploration-lib/domain-layer';
import { mapMetadataKeysWithQuery } from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import { useMemo } from 'react';
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

  return useMemo(() => mapMetadataKeysWithQuery(data, query), [data, query]);
};
