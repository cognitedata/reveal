import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import { queryKeys } from '@data-exploration-lib/domain-layer';
import { getDocumentsUniqueValuesByProperty } from '../network';
import {
  DocumentProperty,
  DocumentSourceProperty,
  DocumentsAggregateUniquePropertiesResponse,
} from '../types';

export const useDocumentsUniqueValuesByProperty = (
  property: DocumentProperty | DocumentSourceProperty,
  query?: string,
  options?: Omit<
    UseQueryOptions<
      DocumentsAggregateUniquePropertiesResponse[],
      unknown,
      DocumentsAggregateUniquePropertiesResponse[],
      any
    >,
    'queryKeys'
  >
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.documentsUniqueValues(property, query),
    () => {
      return getDocumentsUniqueValuesByProperty(sdk, property, {
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    options
  );
};
