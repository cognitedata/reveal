import { DoubleDatapoint } from '@cognite/sdk';
import { atom, selectorFamily } from 'recoil';

export type WorkflowResult = {
  id: string;
  datapoints: DoubleDatapoint[];
};

export const workflowState = atom({
  key: 'workflowState',
  default: [] as WorkflowResult[],
});

export const workflowSummaryById = selectorFamily({
  key: 'workflowSummarySelector',
  get:
    (id: string | undefined) =>
    ({ get }) => {
      const state = get(workflowState);
      const ts = state.find((item) => item.id === id) as WorkflowResult;

      if (!ts) {
        return undefined;
      }

      const min = ts.datapoints.length
        ? Math.min(
            ...ts.datapoints.map((datapoint) =>
              typeof datapoint.value === 'number' ? datapoint.value : NaN
            )
          )
        : NaN;

      const max = ts.datapoints.length
        ? Math.max(
            ...ts.datapoints.map((datapoint) =>
              typeof datapoint.value === 'number' ? datapoint.value : NaN
            )
          )
        : NaN;

      const mean = ts.datapoints.length
        ? ts.datapoints
            .map((datapoint) => datapoint.value || 0)
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
