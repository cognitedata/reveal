import { AssetAggregateResult, Label, Metadata } from '@cognite/sdk';
import { InternalCommonFilters, MatchingLabels } from '../../types';

export interface InternalAssetData {
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
  labelsFlattened?: string[]; //added this extra prop to flatten labels
}

export interface InternalAssetDataWithMatchingLabels extends InternalAssetData {
  matchingLabels?: MatchingLabels; // INFO: This is only optional for now, to not crash the legacy types -_-
}

export interface InternalAssetTreeData
  extends InternalAssetDataWithMatchingLabels {
  children?: InternalAssetTreeData[];
}

export interface InternalAssetFilters extends InternalCommonFilters {
  labels?: { label?: string; value: string }[];
  metadata?: { key: string; value: string }[];
  sources?: { label?: string; value: string }[];
}

export interface OldAssetFilters
  extends Omit<InternalAssetFilters, 'metadata'> {
  metadata?: Metadata;
}
