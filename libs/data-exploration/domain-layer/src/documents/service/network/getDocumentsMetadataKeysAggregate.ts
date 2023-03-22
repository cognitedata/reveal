import { CogniteClient, DocumentFilter } from '@cognite/sdk';
import {
  DocumentsAggregateUniquePropertiesResponse,
  DocumentsMetadataAggregateResponse,
} from '../types';

import { getDocumentsAggregate } from './getDocumentsAggregate';

export const getDocumentsMetadataKeysAggregate = (
  sdk: CogniteClient,
  filter?: DocumentFilter
): Promise<DocumentsMetadataAggregateResponse[]> => {
  return getDocumentsAggregate<DocumentsAggregateUniquePropertiesResponse>(
    sdk,
    {
      aggregate: 'uniqueProperties',
      filter,
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
