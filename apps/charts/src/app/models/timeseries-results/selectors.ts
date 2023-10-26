import { selector } from 'recoil';

import { Chart, getUnitConvertedDatapointsSummary } from '@cognite/charts-lib';

import chartAtom from '../chart/atom';

import { timeseriesAtom } from './atom';
import { TimeseriesCollection } from './types';

export const timeseriesSummaries = selector({
  key: 'timeseriesSummaries',
  get: ({ get }) => {
    const timeseriesResults = get(timeseriesAtom);
    const chart = get(chartAtom);
    return getUnitConvertedTimeseriesSummaries(timeseriesResults, chart!);
  },
});

export function getUnitConvertedTimeseriesSummaries(
  timeseriesResults: TimeseriesCollection,
  chart: Chart
) {
  const convertedSummaries = timeseriesResults.reduce(
    (output, timeseriesResult) => {
      const correspondingTimeseriesDescription =
        chart?.timeSeriesCollection?.find(
          (ts) => ts.tsExternalId === timeseriesResult.externalId
        );
      const { unit, preferredUnit } = correspondingTimeseriesDescription || {};
      return {
        ...output,
        [timeseriesResult.externalId]: getUnitConvertedDatapointsSummary(
          timeseriesResult.series?.datapoints || [],
          unit,
          preferredUnit
        ),
      };
    },
    {} as {
      [key: string]: ReturnType<typeof getUnitConvertedDatapointsSummary>;
    }
  );
  return convertedSummaries;
}
