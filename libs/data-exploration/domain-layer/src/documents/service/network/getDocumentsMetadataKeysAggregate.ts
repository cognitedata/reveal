import { CogniteClient } from '@cognite/sdk';

import {
  DocumentsAggregateFilters,
  DocumentsAggregateUniquePropertiesResponse,
  DocumentsMetadataAggregateResponse,
} from '../types';

import { getDocumentsAggregate } from './getDocumentsAggregate';

export const getDocumentsMetadataKeysAggregate = (
  sdk: CogniteClient,
  filters: DocumentsAggregateFilters = {}
): Promise<DocumentsMetadataAggregateResponse[]> => {
  return getDocumentsAggregate<DocumentsAggregateUniquePropertiesResponse>(
    sdk,
    {
      ...filters,
      aggregate: 'uniqueProperties',
      properties: [
        {
          property: ['sourceFile', 'metadata'],
        },
      ],
    }
  ).then(({ items }) => {
    return items.map(({ count, values }) => {
      return {
        count,
        value: values[0],
        values,
      };
    });
  });
};
