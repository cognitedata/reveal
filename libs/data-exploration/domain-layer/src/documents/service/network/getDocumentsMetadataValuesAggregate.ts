import { CogniteClient, DocumentFilter } from '@cognite/sdk';
import {
  EventsAggregateUniqueValuesResponse,
  EventsMetadataAggregateResponse,
} from '@data-exploration-lib/domain-layer';
import { getDocumentsAggregate } from './getDocumentsAggregate';

export const getDocumentsMetadataValuesAggregate = (
  sdk: CogniteClient,
  metadataKey: string,
  filter?: DocumentFilter
): Promise<EventsMetadataAggregateResponse[]> => {
  return getDocumentsAggregate<EventsAggregateUniqueValuesResponse>(sdk, {
    aggregate: 'uniqueValues',
    properties: [
      {
        property: ['sourceFile', 'metadata', metadataKey],
      },
    ],
    filter,
  }).then(({ items }) => {
    return items.map((item) => {
      return {
        ...item,
        value: item.values[0],
      };
    });
  });
};
