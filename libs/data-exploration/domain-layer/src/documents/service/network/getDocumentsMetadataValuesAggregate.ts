import { CogniteClient } from '@cognite/sdk';
import {
  AggregateFilters,
  EventsAggregateUniqueValuesResponse,
  EventsMetadataAggregateResponse,
} from '@data-exploration-lib/domain-layer';
import { getDocumentsAggregate } from './getDocumentsAggregate';

export const getDocumentsMetadataValuesAggregate = (
  sdk: CogniteClient,
  metadataKey: string,
  filters: AggregateFilters = {}
): Promise<EventsMetadataAggregateResponse[]> => {
  return getDocumentsAggregate<EventsAggregateUniqueValuesResponse>(sdk, {
    ...filters,
    aggregate: 'uniqueValues',
    properties: [
      {
        property: ['sourceFile', 'metadata', metadataKey],
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
