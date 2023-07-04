import { ScheduledCalculationTask } from '@charts-app/domain/scheduled-calculation/service/types';

import {
  DatapointAggregates,
  StringDatapoints,
  DoubleDatapoints,
} from '@cognite/sdk';

export type ScheduledCalculationData = ScheduledCalculationTask & {
  loading: boolean;
  series?: DatapointAggregates | StringDatapoints | DoubleDatapoints;
};

export type ScheduledCalculationsDataMap = {
  [taskId: string]: ScheduledCalculationData;
};
