import { selector, useRecoilState, useResetRecoilState } from 'recoil';

import { globalFilterAtom } from '../atoms';
import { GlobalFilter } from '../types';
import { defaultFilterSetter } from '../utils';

const globalAssetFilters = selector<GlobalFilter['filters']['asset']>({
  key: 'GlobalAssetFilters',
  get: ({ get }) => {
    const {
      filters: { asset, common },
    } = get(globalFilterAtom);

    return { ...common, ...asset };
  },
  set: defaultFilterSetter('asset'),
});

export const useAssetFilters = () => useRecoilState(globalAssetFilters);
export const useResetAssetFilters = () =>
  useResetRecoilState(globalAssetFilters);
