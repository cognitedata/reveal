import {
  Aggregate,
  CogniteExternalId,
  CogniteInternalId,
  DatapointAggregate,
  DatapointsMultiQueryBase,
  IdEither,
  InternalId,
  Timestamp,
} from '@cognite/sdk';

export interface TimeseriesSingleAggregateQuery {
  id?: CogniteInternalId;
  externalId?: CogniteExternalId;
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

export interface TimeseriesDatapointsQueryBase
  extends Omit<DatapointsMultiQueryBase, 'aggregates' | 'granularity'> {
  items: IdEither[];
}

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
