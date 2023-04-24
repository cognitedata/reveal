import { CogniteClient } from '@cognite/sdk';

import {
  DocumentProperty,
  DocumentsAggregateFilters,
  DocumentsAggregateUniquePropertiesResponse,
  DocumentSourceProperty,
} from '../types';

import { getDocumentsAggregate } from './getDocumentsAggregate';

export const getDocumentsUniqueValuesByProperty = (
  sdk: CogniteClient,
  property: DocumentProperty | DocumentSourceProperty,
  filters: DocumentsAggregateFilters = {}
): Promise<DocumentsAggregateUniquePropertiesResponse[]> => {
  return getDocumentsAggregate<DocumentsAggregateUniquePropertiesResponse>(
    sdk,
    {
      ...filters,
      aggregate: 'uniqueValues',
      properties: [
        {
          property: typeof property === 'string' ? [property] : [...property],
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
