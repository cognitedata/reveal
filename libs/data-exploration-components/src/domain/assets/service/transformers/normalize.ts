import { Asset } from '@cognite/sdk';
import { InternalAssetData } from 'domain/assets/internal/types';

export const normalizeAssets = (assets: Asset[]): InternalAssetData[] => {
  return assets.map(asset => ({
    id: asset.id,
    rootId: asset.rootId,
    parentExternalId: asset.parentExternalId,
    lastUpdatedTime: asset.lastUpdatedTime,
    createdTime: asset.createdTime,
    externalId: asset.externalId,
    name: asset.name,
    parentId: asset.parentId,
    description: asset.description,
    dataSetId: asset.dataSetId,
    metadata: asset.metadata,
    source: asset.source,
    labels: asset.labels,
    aggregates: asset.aggregates,
  }));
};
