import { DatapointAggregate, DoubleDatapoint } from '@cognite/sdk';
import { hasRawPoints } from 'components/PlotlyChart/utils';
import { selector, selectorFamily } from 'recoil';
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

export const workflowsSummaryById = selectorFamily({
  key: 'workflowsSummaryById',
  get:
    (id: string | undefined) =>
    ({ get }) => {
      const workflowCollection = get(workflowsAtom);
      return getWorkflowSummaryById(Object.values(workflowCollection), id);
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

  const isRaw = hasRawPoints(wf.datapoints);

  let min: number | undefined;
  let max: number | undefined;
  let mean: number | undefined;

  if (isRaw) {
    const datapoints = wf.datapoints as DoubleDatapoint[];

    min = Math.min(...datapoints.map((datapoint) => datapoint.value));
    max = Math.max(...datapoints.map((datapoint) => datapoint.value));

    const totalSum = datapoints.reduce(
      (total, { value }) => total + (value || 0),
      0
    );

    const totalCount = datapoints.length;

    mean = totalCount ? totalSum / totalCount : undefined;
  } else {
    const datapoints = wf.datapoints as DatapointAggregate[];

    min = Math.min(
      ...datapoints.map((datapoint) =>
        typeof datapoint.min === 'number' ? datapoint.min : NaN
      )
    );

    max = Math.max(
      ...datapoints.map((datapoint) =>
        typeof datapoint.max === 'number' ? datapoint.max : NaN
      )
    );

    const totalSum = datapoints.reduce(
      (total, { sum }) => total + (sum || 0),
      0
    );

    const totalCount = datapoints.reduce(
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
}
