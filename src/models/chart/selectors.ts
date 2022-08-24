import { selector } from 'recoil';
import chartAtom from './atom';
import { ChartTimeSeries, ChartWorkflow } from './types';

export const chartSources = selector({
  key: 'chartSources',
  get: ({ get }) => {
    const chart = get(chartAtom);
    const sources = (chart?.sourceCollection ?? [])
      .map((x) =>
        x.type === 'timeseries'
          ? chart?.timeSeriesCollection?.find((ts) => ts.id === x.id)
          : chart?.workflowCollection?.find((calc) => calc.id === x.id)
      )
      .filter(Boolean) as (ChartTimeSeries | ChartWorkflow)[];
    return sources;
  },
});
