import { GlobalFilter, GlobalFilterKeys } from './types';
import { atom, useRecoilValue } from 'recoil';
import { syncEffect } from 'recoil-sync';
import { custom } from '@recoiljs/refine';
import { FILTER } from './constants';
import { isObjectEmpty } from 'app/utils/compare';

const defaultFilterState = {
  asset: {},
  timeseries: {},
  sequence: {},
  file: {},
  document: {},
  event: {},
};

// TODO: Add some proper object validation here.
const customChecker = <T>() => custom(x => x as T);

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

// WIP
// export const dynamicFilterAtom = atomFamily<DynamicFilter, string>({
//   key: 'DynamicFilter',
//   default: {
//     phrase: '',
//     filters: defaultFilterState,
//   },
// });
