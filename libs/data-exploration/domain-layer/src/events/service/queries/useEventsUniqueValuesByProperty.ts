import { useQuery } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  EventProperty,
  getEventsUniqueValuesByProperty,
  InternalEventsFilters,
  OldEventsFilters,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';

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
