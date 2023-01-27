import { AggregateResponse, TimeseriesFilter } from '@cognite/sdk';
import {
  AdvancedFilter,
  TimeseriesProperties,
} from '@data-exploration-lib/domain-layer';

export type TimeseriesAggregateFilters = {
  filter?: TimeseriesFilter;
  advancedFilter?: AdvancedFilter<TimeseriesProperties>;
};

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

export type TimeseriesAggregateProperty =
  | [TimeseriesProperty]
  | TimeseriesMetadataProperty;

export interface TimeseriesAggregateUniquePropertiesResponse
  extends AggregateResponse {
  values: [
    {
      property: TimeseriesAggregateProperty;
    }
  ];
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
