import { atom } from 'recoil';
import { Chart } from './types';

export const chartAtom = atom<Chart | undefined>({
  key: 'chartAtom',
  default: undefined,
});
