import { atom } from 'recoil';
import { Chart } from 'reducers/charts/types';

export const chartState = atom({
  key: 'chartState',
  default: undefined as Chart | undefined,
});
