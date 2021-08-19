import { atom, selector } from 'recoil';
import { Chart } from 'reducers/charts/types';

export const chartState = atom({
  key: 'chartState',
  default: undefined as Chart | undefined,
});

export const chartSourceCountState = selector({
  key: 'chartSourceCountState',
  get: ({ get }) => {
    const chart = get(chartState);

    if (!chart) {
      return 0;
    }

    return (
      (chart.timeSeriesCollection?.length || 0) +
      (chart.workflowCollection?.length || 0)
    );
  },
});
