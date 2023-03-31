import { AggregateResponse, TimeseriesFilter } from '@cognite/sdk';
import {
  AdvancedFilter,
  TimeseriesProperties,
} from '@data-exploration-lib/domain-layer';
import { AggregateFilters } from '../../types';

export interface TimeseriesAggregateFilters extends AggregateFilters {
  filter?: TimeseriesFilter;
  advancedFilter?: AdvancedFilter<TimeseriesProperties>;
}

export type TimeseriesAggregateOptions =
  | {
      aggregate?: 'uniqueProperties';
    }
  | {
      aggregate: 'count';
      properties?: [TimeseriesAggregateProperty];
    }
  | {
      aggregate: 'approximateCardinality' | 'uniqueValues';
      properties: [TimeseriesAggregateProperty];
    };

export type TimeseriesAggregateRequestPayload = TimeseriesAggregateFilters &
  TimeseriesAggregateOptions & {
    path?: string[];
  };

export interface TimeseriesAggregateProperty {
  property: [TimeseriesProperty] | TimeseriesMetadataProperty;
}

export interface TimeseriesAggregateUniquePropertiesResponse
  extends AggregateResponse {
  values: [TimeseriesAggregateProperty];
}

export interface TimeseriesAggregateUniqueValuesResponse
  extends AggregateResponse {
  values: [string];
}

export interface TimeseriesMetadataAggregateResponse extends AggregateResponse {
  value: string;
  values: string[];
}

export type TimeseriesProperty = 'unit';

export type TimeseriesMetadataProperty = ['metadata', string];
