import { useQuery, UseQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';

import {
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { DocumentsMetadataAggregateResponse } from '../types';
import { getDocumentsMetadataValuesAggregate } from '../network/getDocumentsMetadataValuesAggregate';
import {
  InternalDocumentFilter,
  OldFilesFilters,
} from '@data-exploration-lib/core';

export const useDocumentsMetadataValuesAggregateQuery = (
  metadataKey?: string | null,
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
    queryKeys.documentsMetadataValues(String(metadataKey), filter),
    () => {
      return getDocumentsMetadataValuesAggregate(
        sdk,
        String(metadataKey),
        transformNewFilterToOldFilter(filter)
      );
    },
    {
      enabled:
        !isEmpty(metadataKey) &&
        (isUndefined(options?.enabled) ? true : options?.enabled),
      ...options,
    }
  );
};
