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

export interface TimeseriesSingleAggregateQueryBase {
  aggregates: Aggregate[];
  start?: string | Timestamp;
  end?: string | Timestamp;
}

export interface TimeseriesSingleAggregateQuery
  extends TimeseriesSingleAggregateQueryBase {
  id?: CogniteInternalId;
  externalId?: CogniteExternalId;
}

export interface TimeseriesSingleAggregateMultiQuery
  extends TimeseriesSingleAggregateQueryBase {
  items: IdEither[];
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
  item: IdEither;
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

export interface TimeseriesDatapointsResponse extends InternalId {
  externalId?: CogniteExternalId;
  datapoints: TimeseriesDatapoint[];
}

export interface TimeseriesDatapoint extends DatapointAggregate {
  value?: string | number;
}
