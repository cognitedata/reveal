import { InternalAssetFilters } from '../types';

export const mapInternalFilterToAssetFilter = ({
  assetSubtreeIds,
}: InternalAssetFilters) => {
  if (assetSubtreeIds) {
    return { assetSubtreeIds };
  }

  return undefined;
};
