import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import { queryKeys } from '@data-exploration-lib/domain-layer';
import { DocumentsMetadataAggregateResponse } from '../types';
import { getDocumentsMetadataKeysAggregate } from '../network/getDocumentsMetadataKeysAggregate';

export const useDocumentsMetadataKeysAggregateQuery = (
  options?: UseQueryOptions<
    DocumentsMetadataAggregateResponse[],
    unknown,
    DocumentsMetadataAggregateResponse[],
    any
  >
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.documentsMetadata(),
    () => {
      return getDocumentsMetadataKeysAggregate(sdk);
    },
    options
  );
};
