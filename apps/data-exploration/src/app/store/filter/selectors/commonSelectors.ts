import { InternalCommonFilters } from '@cognite/data-exploration';
import { selector, useRecoilState, useResetRecoilState } from 'recoil';

import { globalFilterAtom } from '../atoms';
import { defaultFilterSetter } from '../utils';

const globalCommonFilters = selector<InternalCommonFilters>({
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
