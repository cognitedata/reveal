import { atom } from 'recoil';
import { Chart } from './types';

const chartAtom = atom<Chart | undefined>({
  key: 'chartAtom',
  default: undefined,
});

export default chartAtom;
