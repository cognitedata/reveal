import { selector, useRecoilState, useResetRecoilState } from 'recoil';

import { globalFilterAtom } from '../atoms';
import { CommonFacets } from '../types';
import { defaultFilterSetter } from '../utils';

const globalCommonFilters = selector<CommonFacets>({
  key: 'GlobalCommonFilters',
  get: ({ get }) => {
    const {
      filters: { common },
    } = get(globalFilterAtom);

    return common;
  },
  set: defaultFilterSetter('common'),
});
export const useCommonFilters = () => useRecoilState(globalCommonFilters);
export const useResetCommonFilters = () =>
  useResetRecoilState(globalCommonFilters);
