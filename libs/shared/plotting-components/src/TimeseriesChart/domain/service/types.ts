import {
  Aggregate,
  DatapointAggregate,
  DatapointsMultiQueryBase,
  StringDatapoint,
} from '@cognite/sdk';

export interface DatapointsQueryBase
  extends Omit<DatapointsMultiQueryBase, 'aggregates' | 'granularity'> {
  timeseriesId: number;
}

export interface DatapointAggregatesQuery extends DatapointsQueryBase {
  aggregates: Aggregate[];
  granularity?: string;
}

export type StringDatapointsQuery = DatapointsQueryBase;

export type TimeseriesDatapoint = DatapointAggregate | StringDatapoint;
