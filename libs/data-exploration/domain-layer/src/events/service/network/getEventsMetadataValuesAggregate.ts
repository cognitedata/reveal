import { CogniteClient } from '@cognite/sdk';
import {
  EventsAggregateFilters,
  EventsAggregateUniqueValuesResponse,
  EventsMetadataAggregateResponse,
} from '@data-exploration-lib/domain-layer';

import { getEventsAggregate } from './getEventsAggregate';

export const getEventsMetadataValuesAggregate = (
  sdk: CogniteClient,
  metadataKey: string,
  filters: EventsAggregateFilters = {}
): Promise<EventsMetadataAggregateResponse[]> => {
  return getEventsAggregate<EventsAggregateUniqueValuesResponse>(sdk, {
    ...filters,
    aggregate: 'uniqueValues',
    properties: [
      {
        property: ['metadata', metadataKey],
      },
    ],
  }).then(({ items }) => {
    return items.map((item) => {
      return {
        ...item,
        value: item.values[0],
      };
    });
  });
};
