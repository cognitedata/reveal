import {
  CogniteExternalId,
  CogniteInternalId,
  IdEither,
  Metadata,
  Timestamp,
} from '@cognite/sdk';

import { MatchingLabels } from '../../types';

export interface InternalEventsData {
  id: number;
  startTime?: Timestamp;
  endTime?: Timestamp;
  metadata?: Metadata;
  source?: string;
  type?: string;
  subtype?: string;
  description?: string;
  assetIds?: number[];
  dataSetId?: CogniteInternalId;
  assetSubtreeIds?: IdEither[];
  lastUpdatedTime: Date;
  createdTime: Date;
  externalId?: CogniteExternalId;
}

export interface InternalEventDataWithMatchingLabels
  extends InternalEventsData {
  matchingLabels?: MatchingLabels; // INFO: This is only optional for now, to not crash the legacy types -_-
}
