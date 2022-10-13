import { selector, useRecoilState, useResetRecoilState } from 'recoil';

import { globalFilterAtom } from '../atoms';
import { GlobalFilter } from '../types';
import { defaultFilterSetter } from '../utils';

const globalTimeseriesFilters = selector<GlobalFilter['filters']['timeseries']>(
  {
    key: 'GlobalTimeseriesFilters',
    get: ({ get }) => {
      const {
        filters: { timeseries, common },
      } = get(globalFilterAtom);

      return { ...timeseries, ...common };
    },
    set: defaultFilterSetter('timeseries'),
  }
);
export const useTimeseriesFilters = () =>
  useRecoilState(globalTimeseriesFilters);
export const useResetTimeseriesFilters = () =>
  useResetRecoilState(globalTimeseriesFilters);
