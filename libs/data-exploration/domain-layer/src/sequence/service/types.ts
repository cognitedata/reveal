import { AggregateResponse, SequenceFilter } from '@cognite/sdk';
import {
  AdvancedFilter,
  AggregateFilters,
  SequenceProperties,
} from '@data-exploration-lib/domain-layer';

export interface SequencesAggregateFilters extends AggregateFilters {
  filter?: SequenceFilter['filter'];
  advancedFilter?: AdvancedFilter<SequenceProperties>;
}

export type SequencesAggregateOptions =
  | {
      aggregate?: 'uniqueProperties';
    }
  | {
      aggregate: 'count';
      properties?: [SequencesAggregateProperty];
    }
  | {
      aggregate: 'approximateCardinality' | 'uniqueValues';
      properties: [SequencesAggregateProperty];
    };

export type SequencesAggregateRequestPayload = SequencesAggregateFilters &
  SequencesAggregateOptions & {
    path?: string[];
  };

export interface SequencesAggregateProperty {
  property: [SequenceProperty] | SequenceMetadataProperty;
}

export interface SequencesAggregateUniquePropertiesResponse
  extends AggregateResponse {
  values: [SequencesAggregateProperty];
}

export interface SequencesAggregateUniqueValuesResponse
  extends AggregateResponse {
  values: [string];
}

export interface SequencesMetadataAggregateResponse extends AggregateResponse {
  value: string;
  values: string[];
}

export type SequenceProperty = 'labels' | 'source';

export type SequenceMetadataProperty = ['metadata', string];
