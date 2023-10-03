import {
  DatapointAggregates,
  StringDatapoints,
  DoubleDatapoints,
} from '@cognite/sdk';

import { ScheduledCalculationTask } from '../../domain/scheduled-calculation/service/types';

export type ScheduledCalculationData = ScheduledCalculationTask & {
  loading: boolean;
  series?: DatapointAggregates | StringDatapoints | DoubleDatapoints;
};

export type ScheduledCalculationsDataMap = {
  [taskId: string]: ScheduledCalculationData;
};
