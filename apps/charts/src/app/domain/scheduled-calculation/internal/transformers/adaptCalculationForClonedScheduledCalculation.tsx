import { ScheduledCalculationTask } from '@charts-app/domain/scheduled-calculation/service/types';
import {
  ChartWorkflowV2,
  ScheduledCalculation,
} from '@charts-app/models/chart/types';
import { getEntryColor } from '@charts-app/utils/colors';
import { omit } from 'lodash';

import { Timeseries } from '@cognite/sdk';

export const adaptCalculationForClonedScheduledCalculation = (
  workflow: ChartWorkflowV2,
  chartId: string,
  scheduledCalculationTask: ScheduledCalculationTask,
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
