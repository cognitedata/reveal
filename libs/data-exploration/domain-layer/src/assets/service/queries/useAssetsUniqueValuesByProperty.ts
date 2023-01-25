import { useQuery } from 'react-query';

import { useSDK } from '@cognite/sdk-provider';
import {
  AssetProperty,
  getAssetsUniqueValuesByProperty,
  InternalAssetFilters,
  OldAssetFilters,
  queryKeys,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';

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
