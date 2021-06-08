import {
  GetAggregateDatapoint,
  GetStringDatapoint,
  GetDoubleDatapoint,
  DatapointsMultiQueryBase,
  DatapointsGetAggregateDatapoint,
  DatapointsGetDatapoint,
  TimeSeriesList,
} from '@cognite/sdk-v2';

export type AggregateDatapoint = Omit<GetAggregateDatapoint, 'timestamp'> & {
  timestamp: number;
};

export type DoubleDatapoint = Omit<GetDoubleDatapoint, 'timestamp'> & {
  timestamp: number;
};

export type StringDatapoint = Omit<GetStringDatapoint, 'timestamp'> & {
  timestamp: number;
};

export type Datapoint = AggregateDatapoint | DoubleDatapoint | StringDatapoint;

export type SDKDatapoint =
  | GetAggregateDatapoint
  | GetStringDatapoint
  | GetDoubleDatapoint;

export type OnFetchDatapoints = (
  externalId: string,
  params: DatapointsMultiQueryBase
) => Promise<DatapointsGetAggregateDatapoint[] | DatapointsGetDatapoint[]>;

export type OnFetchTimeseries = (externalId: string) => Promise<TimeSeriesList>;

export type Options = {
  scaleYAxis?: boolean;
  onFetchTimeseries?: OnFetchTimeseries;
  onFetchDatapoints?: OnFetchDatapoints;
};
