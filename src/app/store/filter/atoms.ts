import { GlobalFilter } from './types';
import { atom } from 'recoil';
import { syncEffect } from 'recoil-sync';
import { custom } from '@recoiljs/refine';
import { FILTER } from './constants';

const defaultFilterState = {
  asset: {},
  timeseries: {},
  sequence: {},
  file: {},
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

// WIP
// export const dynamicFilterAtom = atomFamily<DynamicFilter, string>({
//   key: 'DynamicFilter',
//   default: {
//     phrase: '',
//     filters: defaultFilterState,
//   },
// });
