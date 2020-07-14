import {
  GetAggregateDatapoint,
  GetStringDatapoint,
  GetDoubleDatapoint,
} from '@cognite/sdk';

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
