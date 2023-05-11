import {
  DatapointAggregates,
  StringDatapoints,
  DoubleDatapoints,
} from '@cognite/sdk';

export type ScheduledCalculationData = {
  externalId: string;
  loading: boolean;
  series?: DatapointAggregates | StringDatapoints | DoubleDatapoints;
};

export type ScheduledCalculationsDataMap = {
  [taskId: string]: ScheduledCalculationData;
};
