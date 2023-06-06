import { selector, useRecoilValue } from 'recoil';
import chartAtom from './atom';
import { ChartSource } from './types';
import { scheduledCalculationDataAtom } from '../scheduled-calculation-results/atom';

export const chartSources = selector<ChartSource[]>({
  key: 'chartSources',
  get: ({ get }) => {
    const chart = get(chartAtom);
    const scheduledCalculationData = get(scheduledCalculationDataAtom);
    const sources = (chart?.sourceCollection ?? [])
      .map((source) => {
        switch (source.type) {
          case 'timeseries':
            return chart?.timeSeriesCollection?.find(
              (ts) => ts.id === source.id
            );
          case 'workflow':
            return chart?.workflowCollection?.find(
              (calc) => calc.id === source.id
            );
          case 'scheduledCalculation': {
            const scheduledCalculation =
              chart?.scheduledCalculationCollection?.find(
                (sc) => sc.id === source.id
              );
            const scheduledCalculationResult =
              scheduledCalculationData[source.id];
            return (
              scheduledCalculation && {
                ...scheduledCalculation,
                // need to populate name from scheduledCalculationTask
                name:
                  scheduledCalculationResult?.name || scheduledCalculation.name,
              }
            );
          }
          default:
            return undefined;
        }
      })
      .filter(Boolean) as ChartSource[];
    return sources;
  },
});

export const useChartSourcesValue = () => useRecoilValue(chartSources);
