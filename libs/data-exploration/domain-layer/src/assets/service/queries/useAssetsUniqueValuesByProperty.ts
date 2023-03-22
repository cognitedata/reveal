import { useQuery } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AssetProperty,
  getAssetsUniqueValuesByProperty,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import {
  InternalAssetFilters,
  OldAssetFilters,
} from '@data-exploration-lib/core';

export const useAssetsUniqueValuesByProperty = (
  property: AssetProperty,
  filter?: InternalAssetFilters | OldAssetFilters
) => {
  const sdk = useSDK();

  return useQuery(queryKeys.assetsUniqueValues(property, filter), () => {
    return getAssetsUniqueValuesByProperty(sdk, property, {
      filter: transformNewFilterToOldFilter(filter),
    });
  });
};
