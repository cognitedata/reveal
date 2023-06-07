import { CalculationTaskSchedule } from '@charts-app/domain/scheduled-calculation/service/types';

import {
  DatapointAggregates,
  StringDatapoints,
  DoubleDatapoints,
} from '@cognite/sdk';

export type ScheduledCalculationData = CalculationTaskSchedule & {
  loading: boolean;
  series?: DatapointAggregates | StringDatapoints | DoubleDatapoints;
};

export type ScheduledCalculationsDataMap = {
  [taskId: string]: ScheduledCalculationData;
};
