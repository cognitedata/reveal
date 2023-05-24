import { useQuery, UseQueryOptions } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';
import { AdvancedFilter } from '../../../builders';
import { queryKeys } from '../../../queryKeys';
import { DocumentProperties } from '../../internal';

import { DocumentsMetadataAggregateResponse } from '../types';
import { getDocumentsMetadataKeysAggregate } from '../network';

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
