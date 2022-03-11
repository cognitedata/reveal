import {
  DatapointAggregate,
  StringDatapoint as SdkStringDatapoint,
  DoubleDatapoint as SdkDoubleDatapoint,
  DatapointsMultiQueryBase,
  DatapointAggregates,
  Datapoints,
  Timeseries,
} from '@cognite/sdk';

export type AggregateDatapoint = Omit<DatapointAggregate, 'timestamp'> & {
  timestamp: number;
};

export type DoubleDatapoint = Omit<SdkDoubleDatapoint, 'timestamp'> & {
  timestamp: number;
};

export type StringDatapoint = Omit<SdkStringDatapoint, 'timestamp'> & {
  timestamp: number;
};

export type Datapoint = AggregateDatapoint | DoubleDatapoint | StringDatapoint;

export type SDKDatapoint =
  | DatapointAggregate
  | SdkStringDatapoint
  | SdkDoubleDatapoint;

export type OnFetchDatapoints = (
  externalId: string,
  params: DatapointsMultiQueryBase
) => Promise<DatapointAggregates[] | Datapoints[]>;

export type OnFetchTimeseries = (externalId: string) => Promise<Timeseries[]>;

export type Options = {
  scaleYAxis?: boolean;
  onFetchTimeseries?: OnFetchTimeseries;
  onFetchDatapoints?: OnFetchDatapoints;
};
