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

      const min = Math.min(
        ...ts.datapoints.map((datapoint) => datapoint.min || Infinity)
      );

      const max = Math.max(
        ...ts.datapoints.map((datapoint) => datapoint.max || -Infinity)
      );

      const mean =
        ts.datapoints
          .map((datapoint) => datapoint.average || 0)
          .reduce((total, average) => total + average, 0) /
        ts.datapoints.length;

      return {
        min,
        max,
        mean,
      };
    },
});
