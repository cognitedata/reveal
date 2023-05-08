import { ChartWorkflowV2, ScheduledCalculation } from 'models/chart/types';
import { omit } from 'lodash';
import { CogniteExternalId } from '@cognite/sdk';
import { getEntryColor } from 'utils/colors';

export const adaptCalculationForClonedScheduledCalculation = (
  workflow: ChartWorkflowV2,
  chartId: string,
  externalId: CogniteExternalId
): ScheduledCalculation => {
  const scheduledCalculation = omit(
    workflow,
    'statisticsCalls',
    'dataProfilingCalls',
    'calls',
    'id'
  );
  return {
    ...scheduledCalculation,
    type: 'scheduledCalculation',
    id: externalId,
    createdAt: Date.now(),
    color: getEntryColor(chartId, externalId),
  };
};
