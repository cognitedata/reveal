import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  getAssetsMetadataKeysAggregate,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import { AssetsMetadataAggregateResponse } from '../types';
import {
  InternalAssetFilters,
  OldAssetFilters,
} from '@data-exploration-lib/core';

export const useAssetsMetadataKeysAggregateQuery = (
  filter?: InternalAssetFilters | OldAssetFilters,
  query?: string,
  options?: UseQueryOptions<
    AssetsMetadataAggregateResponse[],
    unknown,
    AssetsMetadataAggregateResponse[],
    any
  >
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.assetsMetadata(filter, query),
    () => {
      return getAssetsMetadataKeysAggregate(sdk, {
        filter: transformNewFilterToOldFilter(filter),
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    options
  );
};
