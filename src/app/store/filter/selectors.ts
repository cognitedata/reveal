import { globalFilterAtom } from 'app/store/filter';
import { CommonFacets, GlobalFilter } from 'app/store/filter/types';
import { defaultFilterSetter } from 'app/store/filter/utils';
import { selector, useRecoilState } from 'recoil';

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

const globalSequenceFilters = selector<GlobalFilter['filters']['sequence']>({
  key: 'GlobalSequenceFilters',
  get: ({ get }) => {
    const {
      filters: { sequence, common },
    } = get(globalFilterAtom);

    return { ...sequence, ...common };
  },
  set: defaultFilterSetter('sequence'),
});
export const useSequenceFilters = () => useRecoilState(globalSequenceFilters);
