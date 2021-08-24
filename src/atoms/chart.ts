import { atom, selector } from 'recoil';
import { Chart, ChartTimeSeries, ChartWorkflow } from 'reducers/charts/types';

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

export const chartTimeseriesFilteredState = selector({
  key: 'chartTimeseriesFiltered',
  get: ({ get }) => {
    const chart = get(chartState);

    return chart?.timeSeriesCollection?.map((t) => {
      return {
        ...t,
        statisticsCalls: undefined,
      };
    }) as ChartTimeSeries[];
  },
});

export const chartWorkflowsFilteredState = selector({
  key: 'chartWorkflowsFiltered',
  get: ({ get }) => {
    const chart = get(chartState);

    return chart?.workflowCollection?.map((t) => {
      return {
        ...t,
        calls: undefined,
        statisticsCalls: undefined,
      };
    }) as ChartWorkflow[];
  },
});
