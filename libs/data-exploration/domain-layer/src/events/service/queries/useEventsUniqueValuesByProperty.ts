import { useQuery } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AdvancedFilter,
  EventProperty,
  EventsProperties,
  getEventsUniqueValuesByProperty,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';

import {
  InternalEventsFilters,
  OldEventsFilters,
} from '@data-exploration-lib/core';

interface Props {
  property: EventProperty;
  filter?: InternalEventsFilters | OldEventsFilters;
  advancedFilter?: AdvancedFilter<EventsProperties>;
  query?: string;
}

export const useEventsUniqueValuesByProperty = ({
  property,
  filter,
  advancedFilter,
  query,
}: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.eventsUniqueValues(property, filter, advancedFilter, query),
    () => {
      return getEventsUniqueValuesByProperty(sdk, property, {
        filter: transformNewFilterToOldFilter(filter),
        advancedFilter,
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      keepPreviousData: true,
    }
  );
};
