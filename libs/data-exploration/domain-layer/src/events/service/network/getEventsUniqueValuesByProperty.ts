import { CogniteClient, UniqueValuesAggregateResponse } from '@cognite/sdk';
import {
  EventProperty,
  EventsAggregateFilters,
} from '@data-exploration-lib/domain-layer';

import { getEventsAggregate } from './getEventsAggregate';

export const getEventsUniqueValuesByProperty = (
  sdk: CogniteClient,
  property: EventProperty,
  filters: EventsAggregateFilters = {}
): Promise<UniqueValuesAggregateResponse[]> => {
  return getEventsAggregate<UniqueValuesAggregateResponse>(sdk, {
    ...filters,
    aggregate: 'uniqueValues',
    properties: [
      {
        property: [property],
      },
    ],
  }).then(({ items }) => items);
};
