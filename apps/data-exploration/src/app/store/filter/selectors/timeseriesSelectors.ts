import { selector, useRecoilState, useResetRecoilState } from 'recoil';

import { globalFilterAtom } from '../atoms';
import { GlobalFilter } from '../types';
import { defaultFilterSetter } from '../utils';

const globalTimeseriesFilters = selector<GlobalFilter['filters']['timeSeries']>(
  {
    key: 'GlobalTimeseriesFilters',
    get: ({ get }) => {
      const {
        filters: { timeSeries, common },
      } = get(globalFilterAtom);

      return { ...common, ...timeSeries };
    },
    set: defaultFilterSetter('timeSeries'),
  }
);
export const useTimeseriesFilters = () =>
  useRecoilState(globalTimeseriesFilters);
export const useResetTimeseriesFilters = () =>
  useResetRecoilState(globalTimeseriesFilters);
