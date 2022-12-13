import { GlobalFilter, GlobalFilterKeys } from './types';
import { atom, useRecoilState, useRecoilValue } from 'recoil';
import { syncEffect } from 'recoil-sync';
import { custom } from '@recoiljs/refine';
import { FILTER } from './constants';
import { isObjectEmpty } from '@data-exploration-app/utils/compare';
import { AssetViewMode } from '@cognite/data-exploration';

const defaultFilterState = {
  asset: {},
  timeseries: {},
  sequence: {},
  file: {},
  document: {},
  event: {},
};

// TODO: Add some proper object validation here.
const customChecker = <T>() => custom((x) => x as T);

export const globalFilterAtom = atom<GlobalFilter>({
  key: 'GlobalFilter',
  default: {
    phrase: '',
    filters: {
      ...defaultFilterState,
      common: {},
    },
  },
  effects: [syncEffect({ refine: customChecker(), itemKey: FILTER })],
});

export const useFilterEmptyState = (key: GlobalFilterKeys) => {
  const {
    filters: { [key]: facets },
  } = useRecoilValue(globalFilterAtom);

  return isObjectEmpty(facets);
};

export const filterSidebar = atom({
  key: 'FilterSidebar',
  default: true,
});
export const useFilterSidebarState = () => useRecoilState(filterSidebar);

export const assetView = atom<AssetViewMode>({
  key: 'AssetView',
  default: 'tree',
});
export const useAssetViewState = () => useRecoilState(assetView);

// WIP
// export const dynamicFilterAtom = atomFamily<DynamicFilter, string>({
//   key: 'DynamicFilter',
//   default: {
//     phrase: '',
//     filters: defaultFilterState,
//   },
// });
