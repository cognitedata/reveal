import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AdvancedFilter,
  DocumentProperties,
  queryKeys,
} from '@data-exploration-lib/domain-layer';
import { DocumentsMetadataAggregateResponse } from '../types';
import { getDocumentsMetadataKeysAggregate } from '../network/getDocumentsMetadataKeysAggregate';

interface Props {
  query?: string;
  filter?: AdvancedFilter<DocumentProperties>;
  options?: UseQueryOptions<
    DocumentsMetadataAggregateResponse[],
    unknown,
    DocumentsMetadataAggregateResponse[],
    any
  >;
}

export const useDocumentsMetadataKeysAggregateQuery = ({
  query,
  filter,
  options,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.documentsMetadata(query, filter),
    () => {
      return getDocumentsMetadataKeysAggregate(sdk, {
        filter,
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      keepPreviousData: true,
      ...options,
    }
  );
};
