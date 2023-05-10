import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AdvancedFilter,
  AssetsMetadataAggregateResponse,
  AssetsProperties,
  getAssetsMetadataKeysAggregate,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import { InternalAssetFilters } from '@data-exploration-lib/core';

interface Props {
  query?: string;
  advancedFilter?: AdvancedFilter<AssetsProperties>;
  filter?: InternalAssetFilters;
  options?: UseQueryOptions<
    AssetsMetadataAggregateResponse[],
    unknown,
    AssetsMetadataAggregateResponse[],
    any
  >;
}

export const useAssetsMetadataKeysAggregateQuery = ({
  query,
  advancedFilter,
  filter,
  options,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.assetsMetadata(query, advancedFilter, filter),
    () => {
      return getAssetsMetadataKeysAggregate(sdk, {
        advancedFilter,
        filter: transformNewFilterToOldFilter(filter),
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      keepPreviousData: true,
      ...options,
    }
  );
};
