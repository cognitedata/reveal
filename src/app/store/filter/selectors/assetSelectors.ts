import { globalFilterAtom } from '../atoms';
import { GlobalFilter } from '../types';
import { defaultFilterSetter } from '../utils';
import { selector, useRecoilState, useResetRecoilState } from 'recoil';

const globalAssetFilters = selector<GlobalFilter['filters']['asset']>({
  key: 'GlobalAssetFilters',
  get: ({ get }) => {
    const {
      filters: { asset, common },
    } = get(globalFilterAtom);

    return { ...asset, ...common };
  },
  set: defaultFilterSetter('asset'),
});

export const useAssetFilters = () => useRecoilState(globalAssetFilters);
export const useResetAssetFilters = () =>
  useResetRecoilState(globalAssetFilters);
