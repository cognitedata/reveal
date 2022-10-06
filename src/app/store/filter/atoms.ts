import { DynamicFilter, GlobalFilter } from './types';
import { atom, atomFamily } from 'recoil';

const defaultFilterState = {
  asset: {},
  timeseries: {},
  sequence: {},
  file: {},
  event: {},
};

export const globalFilterAtom = atom<GlobalFilter>({
  key: 'GlobalFilter',
  default: {
    phrase: '',
    filters: {
      ...defaultFilterState,
      common: {},
    },
  },
});

export const dynamicFilterAtom = atomFamily<DynamicFilter, string>({
  key: 'DynamicFilter',
  default: {
    phrase: '',
    filters: defaultFilterState,
  },
});
