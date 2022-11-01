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

export interface InternalAssetFilters extends InternalCommonFilters {
  labels?: { label?: string; value: string }[];
  metadata?: Metadata;
  source?: string;
}
