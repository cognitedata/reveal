import { selector, useRecoilState, useResetRecoilState } from 'recoil';

import { globalFilterAtom } from '../atoms';
import { GlobalFilter } from '../types';
import { defaultFilterSetter } from '../utils';

const globalFileFilters = selector<GlobalFilter['filters']['file']>({
  key: 'GlobalFileFilters',
  get: ({ get }) => {
    const {
      filters: { file, common },
    } = get(globalFilterAtom);

    return { ...file, ...common };
  },
  set: defaultFilterSetter('file'),
});
export const useFileFilters = () => useRecoilState(globalFileFilters);
export const useResetFileFilters = () => useResetRecoilState(globalFileFilters);
