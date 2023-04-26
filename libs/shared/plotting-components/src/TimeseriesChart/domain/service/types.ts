import {
  Aggregate,
  CogniteExternalId,
  DatapointAggregate,
  DatapointsMultiQueryBase,
  InternalId,
  Timestamp,
} from '@cognite/sdk';

export interface TimeseriesSingleAggregateQuery extends InternalId {
  aggregates: Aggregate[];
  start?: string | Timestamp;
  end?: string | Timestamp;
}

export interface TimeseriesSingleAggregate extends InternalId {
  data: Omit<DatapointAggregate, 'timestamp'>;
  externalId?: CogniteExternalId;
  isString?: boolean;
  isStep?: boolean;
  unit?: string;
}

export type TimeseriesDatapointsQueryBase = InternalId &
  Omit<DatapointsMultiQueryBase, 'aggregates' | 'granularity'>;

export type TimeseriesRawDatapointsQuery = TimeseriesDatapointsQueryBase;

export interface TimeseriesAggregateDatapointsQuery
  extends TimeseriesRawDatapointsQuery {
  aggregates: Aggregate[];
  granularity?: string;
}

export type TimeseriesDatapointsQuery =
  | TimeseriesRawDatapointsQuery
  | TimeseriesAggregateDatapointsQuery;

export interface TimeseriesDatapoint extends DatapointAggregate {
  value?: string | number;
}
