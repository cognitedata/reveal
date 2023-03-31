import { AggregateResponse, DocumentFilter } from '@cognite/sdk';
import { InternalDocumentFilter } from '@data-exploration-lib/core';
import { AggregateFilters } from '@data-exploration-lib/domain-layer';
import { AdvancedFilter } from '../../builders';

export interface DocumentsMetadataAggregateResponse extends AggregateResponse {
  value: string;
  values: string[];
}

export interface DocumentsAggregateFilters extends AggregateFilters {
  filter?: DocumentFilter;
  advancedFilter?: AdvancedFilter<InternalDocumentFilter>;
}

export type DocumentsAggregateOptions =
  | {
      aggregate?: 'uniqueProperties';
      properties: [DocumentsAggregateProperty];
    }
  | {
      aggregate: 'count';
      properties?: [DocumentsAggregateProperty];
    }
  | {
      aggregate: 'approximateCardinality' | 'uniqueValues';
      properties: [DocumentsAggregateProperty];
    };

export type DocumentsAggregateRequestPayload = DocumentsAggregateFilters &
  DocumentsAggregateOptions & {
    path?: string[];
  };

// !?
export interface DocumentsAggregateProperty {
  property:
    | [DocumentProperty]
    | DocumentSourceProperty
    | DocumentMetadataKeyProperty
    | DocumentMetadataValueProperty;
}

export type DocumentProperty =
  | 'type'
  | 'sourceFile' // needed?
  | 'source' // needed?
  | 'author'
  | 'labels';

export type DocumentSourceProperty = ['sourceFile', 'source'];

export type DocumentMetadataKeyProperty = [string, 'metadata'];

export type DocumentMetadataValueProperty = [string, 'metadata', string];

export interface DocumentsAggregateUniquePropertiesResponse
  extends AggregateResponse {
  value: string;
  values: string[];
}
