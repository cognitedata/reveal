import { atom, useRecoilState } from 'recoil';

import { TimeseriesCollection } from './types';

export const timeseriesAtom = atom<TimeseriesCollection>({
  key: 'timeseriesAtom',
  default: [],
});

export const useTimeseriesAtom = () => useRecoilState(timeseriesAtom);
