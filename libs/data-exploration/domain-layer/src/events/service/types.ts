import { AggregateResponse, EventFilter } from '@cognite/sdk';
import {
  AdvancedFilter,
  AggregateFilters,
  EventsProperties,
} from '@data-exploration-lib/domain-layer';

/**
 * DOCUMENTATION:
 * https://cognitedata.atlassian.net/wiki/spaces/SFAA/pages/3867312421/ApiSpec+Assets+Events+advanced+aggregation+capabilities
 */

export interface EventsAggregateFilters extends AggregateFilters {
  filter?: EventFilter;
  advancedFilter?: AdvancedFilter<EventsProperties>;
}

export type EventsAggregateOptions =
  | {
      aggregate?: 'uniqueProperties';
    }
  | {
      aggregate: 'count';
      properties?: [EventsAggregateProperty];
    }
  | {
      aggregate: 'approximateCardinality' | 'uniqueValues';
      properties: [EventsAggregateProperty];
    };

export type EventsAggregateRequestPayload = EventsAggregateFilters &
  EventsAggregateOptions & {
    path?: string[];
  };

export interface EventsAggregateProperty {
  property: [EventProperty] | EventMetadataProperty;
}

export interface EventsAggregateUniquePropertiesResponse
  extends AggregateResponse {
  value: EventsAggregateProperty;
  values: [EventsAggregateProperty];
}

export interface EventsAggregateUniqueValuesResponse extends AggregateResponse {
  values: [string];
}

export interface EventsMetadataAggregateResponse extends AggregateResponse {
  value: string;
  values: string[];
}

export type EventProperty = 'type' | 'subtype' | 'dataSetId' | 'source';

export type EventMetadataProperty = ['metadata', string];
