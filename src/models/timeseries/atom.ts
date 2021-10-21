import { atom } from 'recoil';
import { TimeseriesCollection } from './types';

export const timeseriesAtom = atom<TimeseriesCollection>({
  key: 'timeseriesAtom',
  default: [],
});
