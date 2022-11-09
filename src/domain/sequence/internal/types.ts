import { Metadata, SequenceColumn } from '@cognite/sdk';
import { InternalCommonFilters, Order } from '../../types';

export interface InternalSequenceData {
  id: number;
  lastUpdatedTime: Date;
  createdTime: Date;
  name?: string;
  description?: string;
  /**
   * Asset this sequence is associated with
   */
  assetId?: number;
  dataSetId?: number;
  externalId?: string;
  metadata?: Metadata;
  columns: SequenceColumn[];
}

export interface InternalSequenceFilters extends InternalCommonFilters {
  metadata?: { key: string; value: string }[];
}

// We need this type instead of `InternalSortBy` becuase property is a string array for Sequence.
export type InternalSequenceSortBy = {
  property: string[];
  order: Order;
};
export interface OldSequenceFilters
  extends Omit<InternalSequenceFilters, 'metadata'> {
  metadata?: Metadata;
}
