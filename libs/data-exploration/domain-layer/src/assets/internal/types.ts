import { AssetAggregateResult, Label, Metadata } from '@cognite/sdk';
import { InternalCommonFilters } from '../../types';

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

export interface InternalAssetTreeData extends InternalAssetData {
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
