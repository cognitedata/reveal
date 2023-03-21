import { useQuery } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  EventProperty,
  getEventsUniqueValuesByProperty,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import {
  InternalEventsFilters,
  OldEventsFilters,
} from '@data-exploration-lib/core';

export const useEventsUniqueValuesByProperty = (
  property: EventProperty,
  filter?: InternalEventsFilters | OldEventsFilters
) => {
  const sdk = useSDK();

  return useQuery(queryKeys.eventsUniqueValues(property, filter), () => {
    return getEventsUniqueValuesByProperty(sdk, property, {
      filter: transformNewFilterToOldFilter(filter),
    });
  });
};
