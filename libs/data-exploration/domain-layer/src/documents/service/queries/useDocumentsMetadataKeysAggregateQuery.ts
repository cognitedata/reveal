import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import { DocumentsMetadataAggregateResponse } from '../types';
import { getDocumentsMetadataKeysAggregate } from '../network/getDocumentsMetadataKeysAggregate';
import {
  InternalDocumentFilter,
  OldFilesFilters,
} from '@data-exploration-lib/core';

export const useDocumentsMetadataKeysAggregateQuery = (
  filter?: InternalDocumentFilter | OldFilesFilters,
  options?: UseQueryOptions<
    DocumentsMetadataAggregateResponse[],
    unknown,
    DocumentsMetadataAggregateResponse[],
    any
  >
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.documentsMetadata(filter),
    () => {
      return getDocumentsMetadataKeysAggregate(
        sdk,
        transformNewFilterToOldFilter(filter)
      );
    },
    options
  );
};
