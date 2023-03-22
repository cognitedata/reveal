import { Metadata, SequenceColumn } from '@cognite/sdk';

import { MatchingLabels } from '../../types';

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

export interface InternalSequenceDataWithMatchingLabels
  extends InternalSequenceData {
  matchingLabels?: MatchingLabels; // INFO: This is only optional for now, to not crash the legacy types -_-
}
