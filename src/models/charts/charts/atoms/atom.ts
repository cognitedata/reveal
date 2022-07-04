import { atom, useRecoilState } from 'recoil';
import { Chart } from '../types/types';

const chartAtom = atom<Chart | undefined>({
  key: 'chartAtom',
  default: undefined,
});

export const useChartAtom = () => {
  return useRecoilState(chartAtom);
};

export default chartAtom;
