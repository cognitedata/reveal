import { useQuery } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AssetProperty,
  getAssetsUniqueValuesByProperty,
  queryKeys,
} from '@data-exploration-lib/domain-layer';
// import {
//   InternalAssetFilters,
//   OldAssetFilters,
// } from '@data-exploration-lib/core';

export const useAssetsUniqueValuesByProperty = (
  property: AssetProperty,
  query?: string
  // filter?: InternalAssetFilters | OldAssetFilters
) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.assetsUniqueValues(property, query),
    () => {
      return getAssetsUniqueValuesByProperty(sdk, property, {
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      keepPreviousData: true,
    }
  );
};
