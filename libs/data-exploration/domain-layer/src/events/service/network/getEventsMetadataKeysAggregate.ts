import { CogniteClient } from '@cognite/sdk';
import {
  EventMetadataProperty,
  EventsAggregateFilters,
  EventsAggregateUniquePropertiesResponse,
  EventsMetadataAggregateResponse,
} from '@data-exploration-lib/domain-layer';

import { getEventsAggregate } from './getEventsAggregate';

export const getEventsMetadataKeysAggregate = (
  sdk: CogniteClient,
  filters: EventsAggregateFilters = {}
): Promise<EventsMetadataAggregateResponse[]> => {
  return getEventsAggregate<EventsAggregateUniquePropertiesResponse>(sdk, {
    ...filters,
    aggregate: 'uniqueProperties',
    path: ['metadata'],
  }).then(({ items }) => {
    return items.map(({ count, value }) => {
      const metadataKey = (value.property as EventMetadataProperty)[1];
      return {
        count,
        value: metadataKey,
        values: [metadataKey],
      };
    });
  });
};
