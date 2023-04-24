import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AdvancedFilter,
  DocumentProperties,
  queryKeys,
} from '@data-exploration-lib/domain-layer';
import { DocumentsMetadataAggregateResponse } from '../types';
import { getDocumentsMetadataKeysAggregate } from '../network/getDocumentsMetadataKeysAggregate';

interface Props {
  prefix?: string;
  filter?: AdvancedFilter<DocumentProperties>;
  options?: UseQueryOptions<
    DocumentsMetadataAggregateResponse[],
    unknown,
    DocumentsMetadataAggregateResponse[],
    any
  >;
}

export const useDocumentsMetadataKeysAggregateQuery = ({
  prefix,
  filter,
  options,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.documentsMetadata(prefix, filter),
    () => {
      return getDocumentsMetadataKeysAggregate(sdk, {
        filter,
        aggregateFilter: prefix ? { prefix: { value: prefix } } : undefined,
      });
    },
    {
      keepPreviousData: true,
      ...options,
    }
  );
};
