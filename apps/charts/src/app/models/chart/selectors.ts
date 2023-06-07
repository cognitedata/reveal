import { selector, useRecoilValue } from 'recoil';

import { scheduledCalculationDataAtom } from '../scheduled-calculation-results/atom';

import chartAtom from './atom';
import { ChartSource } from './types';

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
                // need to populate name & description from scheduledCalculationTask
                name:
                  scheduledCalculationResult?.name || scheduledCalculation.name,
                description:
                  scheduledCalculationResult?.description ||
                  scheduledCalculation.description,
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
