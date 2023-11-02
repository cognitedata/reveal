import { ACDMAggregateFilter } from '@fdx/shared/types/services';

import { AggregateResponse, Timeseries, TimeseriesFilter } from '@cognite/sdk';

import { ACDMAdvancedFilter } from '../../builders';

export interface TimeseriesFilters extends ACDMAggregateFilter {
  filter?: TimeseriesFilter;
  advancedFilter?: ACDMAdvancedFilter<Timeseries>;
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

export type TimeseriesAggregateRequestPayload = TimeseriesFilters &
  TimeseriesAggregateOptions & {
    path?: string[];
  };

export type TimeseriesProperty = 'unit';

export type TimeseriesMetadataProperty = ['metadata', string];

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
