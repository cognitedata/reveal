import {
  DatapointAggregates,
  StringDatapoints,
  DoubleDatapoints,
} from '@cognite/sdk';
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
      const ts = state.find(
        (item) => item.externalId === externalId
      ) as DatapointAggregates;

      if (!ts) {
        return undefined;
      }

      const min = ts.datapoints.length
        ? Math.min(
            ...ts.datapoints.map((datapoint) =>
              typeof datapoint.min === 'number' ? datapoint.min : NaN
            )
          )
        : NaN;

      const max = ts.datapoints.length
        ? Math.max(
            ...ts.datapoints.map((datapoint) =>
              typeof datapoint.max === 'number' ? datapoint.max : NaN
            )
          )
        : NaN;

      const mean = ts.datapoints.length
        ? ts.datapoints
            .map((datapoint) => datapoint.average || 0)
            .reduce((total, average) => total + average, 0) /
          ts.datapoints.length
        : NaN;

      const result = {
        min: Number.isNaN(min) ? undefined : min,
        max: Number.isNaN(max) ? undefined : max,
        mean: Number.isNaN(mean) ? undefined : mean,
      };

      return result;
    },
});
