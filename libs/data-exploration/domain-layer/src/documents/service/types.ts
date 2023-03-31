import { AggregateResponse, DocumentFilter } from '@cognite/sdk';
import { InternalDocumentFilter } from '@data-exploration-lib/core';
import { AdvancedFilter } from '../../builders';
import { AggregateFilters } from '../../types';

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

export interface DocumentsAggregateProperty {
  property:
    | [DocumentProperty]
    | DocumentMetadataKeyProperty
    | DocumentMetadataValueProperty;
}

export type DocumentProperty =
  | 'type'
  | 'sourceFile'
  | 'source'
  | 'author'
  | 'labels';

export type DocumentMetadataKeyProperty = [string, 'metadata'];

export type DocumentMetadataValueProperty = [string, 'metadata', string];

export interface DocumentsAggregateUniquePropertiesResponse
  extends AggregateResponse {
  value: string;
  values: string[];
}
