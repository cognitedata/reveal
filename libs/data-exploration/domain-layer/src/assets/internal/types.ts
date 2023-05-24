import { AssetAggregateResult, Label, Metadata } from '@cognite/sdk';
import { RelationshipLabels } from '@data-exploration-lib/core';
import { MatchingLabels } from '../../types';

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
}

export interface InternalAssetDataWithMatchingLabels extends InternalAssetData {
  matchingLabels?: MatchingLabels; // INFO: This is only optional for now, to not crash the legacy types -_-
}

export interface InternalAssetTreeData
  extends InternalAssetDataWithMatchingLabels {
  children?: InternalAssetTreeData[];
  shouldShowMoreAssetsRow?: boolean;
}

export type AssetWithRelationshipLabels = RelationshipLabels &
  InternalAssetDataWithMatchingLabels;
