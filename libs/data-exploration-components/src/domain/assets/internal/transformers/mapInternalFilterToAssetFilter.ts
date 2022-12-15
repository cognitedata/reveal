import { AssetFilterProps } from '@cognite/sdk';

import { isEmpty } from 'lodash';
import { InternalAssetFilters } from '../types';

// Here put the fields that are not existing/available in advanced filters!?
export const mapInternalFilterToAssetFilter = ({
  assetSubtreeIds,
}: InternalAssetFilters): AssetFilterProps | undefined => {
  let filters: AssetFilterProps = {};

  if (assetSubtreeIds && assetSubtreeIds.length > 0) {
    filters = {
      ...filters,
      assetSubtreeIds: assetSubtreeIds.map(({ value }) => ({
        id: value,
      })),
    };
  }

  return !isEmpty(filters) ? filters : undefined;
};
