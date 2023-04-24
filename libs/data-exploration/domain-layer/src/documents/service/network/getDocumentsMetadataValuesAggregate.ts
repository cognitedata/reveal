import { CogniteClient } from '@cognite/sdk';
import {
  EventsAggregateUniqueValuesResponse,
  EventsMetadataAggregateResponse,
} from '@data-exploration-lib/domain-layer';
import { DocumentsAggregateFilters } from '../types';
import { getDocumentsAggregate } from './getDocumentsAggregate';

export const getDocumentsMetadataValuesAggregate = (
  sdk: CogniteClient,
  metadataKey: string,
  filters: DocumentsAggregateFilters = {}
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
