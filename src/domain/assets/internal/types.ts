import {
  AssetAggregateResult,
  DateRange,
  ExternalIdPrefix,
  IdEither,
  Label,
  LabelFilter,
  Metadata,
} from '@cognite/sdk';

export type InternalAssetData = {
  id: number;
  rootId: number;
  parentExternalId?: string;
  lastUpdatedTime: Date;
  createdTime: Date;
  externalId?: string;
  name: string;
  parentId?: number;
  description?: string;
  dataSetId?: number;
  metadata?: Metadata;
  source?: string;
  labels?: Label[];
  aggregates?: AssetAggregateResult;
};

export type InternalAssetFilters = {
  dataSetIds?: IdEither[];
  assetSubtreeIds?: IdEither[];
  labels?: LabelFilter;
  metadata?: Metadata;
  source?: string;
  createdTime?: DateRange;
  lastUpdatedTime?: DateRange;
  externalIdPrefix?: ExternalIdPrefix;
};
