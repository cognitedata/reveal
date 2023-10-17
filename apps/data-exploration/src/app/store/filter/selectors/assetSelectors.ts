import isEmpty from 'lodash/isEmpty';
import { selector, useRecoilState, useResetRecoilState } from 'recoil';

import { globalFilterAtom } from '../atoms';
import { GlobalFilter } from '../types';
import { defaultFilterSetter } from '../utils';

const globalAssetFilters = selector<GlobalFilter['filters']['asset']>({
  key: 'GlobalAssetFilters',
  get: ({ get }) => {
    let {
      filters: { asset, common },
    } = get(globalFilterAtom);

    /**
     * Property `assetIds` is used in the common filters
     * since it's the relevant filter property for esorce types except "Assets".
     * For "Assets", we should use `parentIds` instead.
     * Hence, the following mapping is made.
     */
    if (common.assetIds && !isEmpty(common.assetIds)) {
      asset = {
        ...asset,
        parentIds: [...(asset.parentIds || []), ...common.assetIds],
      };
      common = {
        ...common,
        assetIds: undefined,
      };
    } else {
      asset = {
        ...asset,
        parentIds: undefined,
      };
    }

    return { ...common, ...asset };
  },
  set: defaultFilterSetter('asset'),
});

export const useAssetFilters = () => useRecoilState(globalAssetFilters);
export const useResetAssetFilters = () =>
  useResetRecoilState(globalAssetFilters);
