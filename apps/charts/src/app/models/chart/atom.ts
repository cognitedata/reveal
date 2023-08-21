import { atom, useRecoilState } from 'recoil';

import { Chart } from './types';

const chartAtom = atom<Chart | undefined>({
  key: 'chartAtom',
  default: undefined,
});

export const useChartAtom = () => {
  return useRecoilState<Chart | undefined>(chartAtom);
};

export default chartAtom;
