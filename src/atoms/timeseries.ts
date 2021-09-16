import {
  DatapointAggregates,
  StringDatapoints,
  DoubleDatapoints,
} from '@cognite/sdk';
import { hasRawPoints } from 'components/PlotlyChart';
import { atom, selectorFamily } from 'recoil';

export const timeseriesState = atom({
  key: 'timeseriesState',
  default: [] as (DatapointAggregates | StringDatapoints | DoubleDatapoints)[],
});

export const timeseriesSummaryById = selectorFamily({
  key: 'timeseriesSummarySelector',
  get:
    (externalId: string | undefined) =>
    ({ get }) => {
      const state = get(timeseriesState);
      const ts = state.find((item) => item.externalId === externalId) as
        | DatapointAggregates
        | DoubleDatapoints;

      if (!ts) {
        return undefined;
      }

      if (!ts.datapoints.length) {
        return undefined;
      }

      const isRaw = hasRawPoints(ts);

      let min: number | undefined;
      let max: number | undefined;
      let mean: number | undefined;

      if (isRaw) {
        const tsRaw = ts as DoubleDatapoints;

        min = Math.min(...tsRaw.datapoints.map((datapoint) => datapoint.value));
        max = Math.max(...tsRaw.datapoints.map((datapoint) => datapoint.value));

        const totalSum = tsRaw.datapoints.reduce(
          (total, { value }) => total + (value || 0),
          0
        );

        const totalCount = tsRaw.datapoints.length;

        mean = totalCount ? totalSum / totalCount : undefined;
      } else {
        const tsAggregate = ts as DatapointAggregates;

        min = Math.min(
          ...tsAggregate.datapoints.map((datapoint) =>
            typeof datapoint.min === 'number' ? datapoint.min : NaN
          )
        );

        max = Math.max(
          ...tsAggregate.datapoints.map((datapoint) =>
            typeof datapoint.max === 'number' ? datapoint.max : NaN
          )
        );

        const totalSum = tsAggregate.datapoints.reduce(
          (total, { sum }) => total + (sum || 0),
          0
        );

        const totalCount = tsAggregate.datapoints.reduce(
          (total, { count }) => total + (count || 0),
          0
        );

        mean = totalCount ? totalSum / totalCount : undefined;
      }

      return {
        min: Number.isNaN(min) ? undefined : min,
        max: Number.isNaN(max) ? undefined : max,
        mean: Number.isNaN(mean) ? undefined : mean,
      };
    },
});
