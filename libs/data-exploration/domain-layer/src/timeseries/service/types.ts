import { AggregateResponse, TimeseriesFilter } from '@cognite/sdk';

import { AdvancedFilter } from '../../builders';
import { AggregateFilters } from '../../types';
import { TimeseriesProperties } from '../internal';

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
  value: string;
}

export interface TimeseriesMetadataAggregateResponse extends AggregateResponse {
  value: string;
  values: string[];
}

export type TimeseriesProperty = 'unit';

export type TimeseriesMetadataProperty = ['metadata', string];
