import {
  DatapointAggregates,
  StringDatapoints,
  DoubleDatapoints,
} from '@cognite/sdk';

export type TimeseriesCollection = (
  | DatapointAggregates
  | StringDatapoints
  | DoubleDatapoints
)[];
