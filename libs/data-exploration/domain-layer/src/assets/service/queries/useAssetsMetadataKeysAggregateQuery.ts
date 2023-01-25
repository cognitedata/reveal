import { useQuery, UseQueryOptions } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import { InternalAssetFilters, OldAssetFilters } from '../../internal';
import {
  getAssetsMetadataKeysAggregate,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import { AssetsMetadataAggregateResponse } from '../types';

export const useAssetsMetadataKeysAggregateQuery = (
  filter?: InternalAssetFilters | OldAssetFilters,
  options?: UseQueryOptions<
    AssetsMetadataAggregateResponse[],
    unknown,
    AssetsMetadataAggregateResponse[],
    any
  >
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.assetsMetadata(filter),
    () => {
      return getAssetsMetadataKeysAggregate(sdk, {
        filter: transformNewFilterToOldFilter(filter),
      });
    },
    options
  );
};
