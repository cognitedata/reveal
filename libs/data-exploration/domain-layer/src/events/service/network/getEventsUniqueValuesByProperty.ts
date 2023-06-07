import { CogniteClient } from '@cognite/sdk';

import {
  EventProperty,
  EventsAggregateFilters,
  EventsAggregateUniqueValuesResponse,
} from '../types';

import { getEventsAggregate } from './getEventsAggregate';

export const getEventsUniqueValuesByProperty = (
  sdk: CogniteClient,
  property: EventProperty,
  filters: EventsAggregateFilters = {}
): Promise<EventsAggregateUniqueValuesResponse[]> => {
  return getEventsAggregate<EventsAggregateUniqueValuesResponse>(sdk, {
    ...filters,
    aggregate: 'uniqueValues',
    properties: [
      {
        property: [property],
      },
    ],
  }).then(({ items }) => items);
};
