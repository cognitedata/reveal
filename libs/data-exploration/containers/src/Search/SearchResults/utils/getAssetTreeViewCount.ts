import get from 'lodash/get';
import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import {
  InternalAssetData,
  InternalAssetTreeData,
} from '@data-exploration-lib/domain-layer';

export const getAssetTreeViewCount = (
  data: InternalAssetData[] | InternalAssetTreeData[]
): number => {
  if (isUndefined(get(head(data), 'children'))) {
    return data.length;
  }

  return getChildAssetsCount(data) + 1; // Adding the root asset to the count
};

export const getChildAssetsCount = (data: InternalAssetTreeData[]): number => {
  return data.reduce((acc, { children = [] }) => {
    if (children.every((child) => isEmpty(child.children))) {
      return acc + children.length;
    }
    return acc + getChildAssetsCount(children);
  }, 0);
};
