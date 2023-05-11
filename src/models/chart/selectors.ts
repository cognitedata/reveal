import { selector } from 'recoil';
import chartAtom from './atom';
import { ChartTimeSeries, ChartWorkflow } from './types';

export const chartSources = selector({
  key: 'chartSources',
  get: ({ get }) => {
    const chart = get(chartAtom);
    const sources = (chart?.sourceCollection ?? [])
      .map((x) => {
        switch (x.type) {
          case 'timeseries':
            return chart?.timeSeriesCollection?.find((ts) => ts.id === x.id);
          case 'workflow':
            return chart?.workflowCollection?.find((calc) => calc.id === x.id);
          case 'scheduledCalculation':
            return chart?.scheduledCalculationCollection?.find(
              (calc) => calc.id === x.id
            );
          default:
            return undefined;
        }
      })
      .filter(Boolean) as (ChartTimeSeries | ChartWorkflow)[];
    return sources;
  },
});
