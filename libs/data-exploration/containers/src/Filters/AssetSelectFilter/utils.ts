import isEmpty from 'lodash/isEmpty';

import { AssetFilterType, MultiSelectFilterValue } from '../types';

const DEFAULT_ASSET_FILTER_TYPE: AssetFilterType = AssetFilterType.AllLinked;

export const getAssetFilterTypeWithValue = (
  value?: Record<AssetFilterType, MultiSelectFilterValue<number> | undefined>
) => {
  if (!value) {
    return DEFAULT_ASSET_FILTER_TYPE;
  }

  const allLinkedAssetsValue = value[AssetFilterType.AllLinked];
  const directlyLinkedAssetsValue = value[AssetFilterType.DirectlyLinked];

  if (isEmpty(allLinkedAssetsValue) && !isEmpty(directlyLinkedAssetsValue)) {
    return AssetFilterType.DirectlyLinked;
  }

  return DEFAULT_ASSET_FILTER_TYPE;
};
