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

// TODO: Remove all of these type and get the exported type from data-exploration component library
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
