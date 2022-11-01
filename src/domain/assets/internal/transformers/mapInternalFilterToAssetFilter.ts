import { AssetFilterProps } from '@cognite/sdk/dist/src';
import { InternalAssetFilters } from '../types';

export const mapInternalFilterToAssetFilter = ({
  assetSubtreeIds,
}: InternalAssetFilters): AssetFilterProps | undefined => {
  if (assetSubtreeIds) {
    return {
      assetSubtreeIds: assetSubtreeIds.map(({ value }) => ({
        id: value,
      })),
    };
  }

  return undefined;
};
