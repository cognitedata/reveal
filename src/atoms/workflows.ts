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
      const wf = state.find((item) => item.id === id) as WorkflowResult;

      if (!wf) {
        return undefined;
      }

      if (wf.datapoints.length) {
        return undefined;
      }

      const min = Math.min(
        ...wf.datapoints.map((datapoint) =>
          typeof datapoint.value === 'number' ? datapoint.value : NaN
        )
      );

      const max = Math.max(
        ...wf.datapoints.map((datapoint) =>
          typeof datapoint.value === 'number' ? datapoint.value : NaN
        )
      );

      const mean =
        wf.datapoints
          .map((datapoint) => datapoint.value || 0)
          .reduce((total, average) => total + average, 0) /
        wf.datapoints.length;

      const result = {
        min: Number.isNaN(min) ? undefined : min,
        max: Number.isNaN(max) ? undefined : max,
        mean: Number.isNaN(mean) ? undefined : mean,
      };

      return result;
    },
});
