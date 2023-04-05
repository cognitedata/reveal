import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import { queryKeys } from '@data-exploration-lib/domain-layer';
import { DocumentsMetadataAggregateResponse } from '../types';
import { getDocumentsMetadataKeysAggregate } from '../network/getDocumentsMetadataKeysAggregate';

export const useDocumentsMetadataKeysAggregateQuery = (
  query?: string,
  options?: UseQueryOptions<
    DocumentsMetadataAggregateResponse[],
    unknown,
    DocumentsMetadataAggregateResponse[],
    any
  >
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.documentsMetadata(query),
    () => {
      return getDocumentsMetadataKeysAggregate(sdk, {
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    options
  );
};
