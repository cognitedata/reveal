import { selector } from 'recoil';
import { workflowsAtom } from './atom';
import { WorkflowResult } from './types';

export const availableWorkflows = selector({
  key: 'availableWorkflows',
  get: ({ get }) => {
    const state = get(workflowsAtom);
    const workflowsAsArray = Object.values(state);
    return workflowsAsArray;
  },
});

export function getWorkflowSummaryById(
  workflows: WorkflowResult[],
  workflowId?: string
) {
  if (!workflowId) {
    return undefined;
  }

  const wf = workflows.find(({ id }) => id === workflowId);

  if (!wf) {
    return undefined;
  }

  if (!wf.datapoints.length) {
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
      .reduce((total, average) => total + average, 0) / wf.datapoints.length;

  const result = {
    min: Number.isNaN(min) ? undefined : min,
    max: Number.isNaN(max) ? undefined : max,
    mean: Number.isNaN(mean) ? undefined : mean,
  };

  return result;
}
