import { Metadata, SequenceColumn } from '@cognite/sdk';
import { InternalCommonFilters } from '../../types';

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

export interface OldSequenceFilters
  extends Omit<InternalSequenceFilters, 'metadata'> {
  metadata?: Metadata;
}
