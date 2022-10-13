import { selector, useRecoilState, useResetRecoilState } from 'recoil';

import { globalFilterAtom } from '../atoms';
import { GlobalFilter } from '../types';
import { defaultFilterSetter } from '../utils';

const globalEventFilters = selector<GlobalFilter['filters']['event']>({
  key: 'GlobalEventsFilters',
  get: ({ get }) => {
    const {
      filters: { event, common },
    } = get(globalFilterAtom);

    return { ...event, ...common };
  },
  set: defaultFilterSetter('event'),
});
export const useEventsFilters = () => useRecoilState(globalEventFilters);
export const useResetEventsFilters = () =>
  useResetRecoilState(globalEventFilters);
