import {
  DatapointAggregates,
  StringDatapoints,
  DoubleDatapoints,
} from '@cognite/sdk';

export type TimeseriesEntry = {
  externalId: string;
  loading: boolean;
  series?: DatapointAggregates | StringDatapoints | DoubleDatapoints;
};

export type TimeseriesCollection = TimeseriesEntry[];
