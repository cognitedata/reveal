import {
  CogniteExternalId,
  CogniteInternalId,
  DateRange,
  ExternalIdPrefix,
  IdEither,
  Metadata,
  NullableProperty,
  Timestamp,
} from '@cognite/sdk';

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

export interface InternalEventsFilters extends InternalCommonFilters {
  startTime?: DateRange;
  endTime?: NullableProperty<DateRange>;
  source?: string;
  type?: string;
  subtype?: string;
  metadata?: Metadata;
}

interface InternalCommonFilters {
  dataSetIds?: IdEither[];
  assetSubtreeIds?: IdEither[];
  createdTime?: DateRange;
  lastUpdatedTime?: DateRange;
  externalIdPrefix?: ExternalIdPrefix;
}
