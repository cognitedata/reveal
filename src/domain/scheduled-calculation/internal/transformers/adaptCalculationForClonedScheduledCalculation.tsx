import { ChartWorkflowV2, ScheduledCalculation } from 'models/chart/types';
import { omit } from 'lodash';
import { Timeseries } from '@cognite/sdk';
import { getEntryColor } from 'utils/colors';
import { CalculationTaskSchedule } from 'domain/scheduled-calculation/service/types';

export const adaptCalculationForClonedScheduledCalculation = (
  workflow: ChartWorkflowV2,
  chartId: string,
  scheduledCalculationTask: CalculationTaskSchedule,
  timeseries: Timeseries
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
    name: scheduledCalculationTask.name!,
    description: scheduledCalculationTask.description,
    id: scheduledCalculationTask.externalId,
    createdAt: Date.now(),
    color: getEntryColor(chartId, scheduledCalculationTask.externalId),
    unit: timeseries.unit || '',
    preferredUnit: timeseries.unit || '',
  };
};
