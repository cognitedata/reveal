import { selector, useRecoilState, useResetRecoilState } from 'recoil';

import { globalFilterAtom } from '../atoms';
import { GlobalFilter } from '../types';
import { defaultFilterSetter } from '../utils';

const globalSequenceFilters = selector<GlobalFilter['filters']['sequence']>({
  key: 'GlobalSequenceFilters',
  get: ({ get }) => {
    const {
      filters: { sequence, common },
    } = get(globalFilterAtom);

    return { ...common, ...sequence };
  },
  set: defaultFilterSetter('sequence'),
});
export const useSequenceFilters = () => useRecoilState(globalSequenceFilters);
export const useResetSequenceFilters = () =>
  useResetRecoilState(globalSequenceFilters);
