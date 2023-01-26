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
      // TODO: remove [string[]] when api fixed.
      properties?: [TimeseriesAggregateProperty] | [string[]];
    }
  | {
      aggregate: 'approximateCardinality' | 'uniqueValues';
      // TODO: remove [string[]] when api fixed.
      properties: [TimeseriesAggregateProperty] | [string[]];
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
  value: TimeseriesAggregateProperty;
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
