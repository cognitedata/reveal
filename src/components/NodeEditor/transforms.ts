/* eslint camelcase: 0 */

import { Operation } from '@cognite/calculation-backend';
import {
  Chart,
  ChartWorkflow,
  ChartWorkflowV2,
} from 'models/charts/charts/types/types';
import { resolveTimeseriesSourceInSteps } from './utils';
import { getStepsFromWorkflowReactFlow } from './V2/transforms';

export function getStepsFromWorkflow(
  chart: Chart,
  workflow: ChartWorkflow,
  operations?: Operation[]
) {
  if (!operations) {
    return [];
  }

  /**
   * Get all v2 workflows
   */
  const workflows = chart.workflowCollection?.filter(
    ({ version }) => version === 'v2'
  ) as ChartWorkflowV2[];

  /**
   * Get all timeseries that can be used as sources
   */
  const timeseries = chart.timeSeriesCollection;

  /**
   * Generate the steps
   */
  const steps = getStepsFromWorkflowReactFlow(
    workflow as ChartWorkflowV2,
    workflows,
    operations
  );

  /**
   * Resolve all the timeseries value steps into actual external ids
   */
  const resolvedSteps = resolveTimeseriesSourceInSteps(steps, timeseries);

  /**
   * Provide the resolved steps as output
   */
  return resolvedSteps;
}
