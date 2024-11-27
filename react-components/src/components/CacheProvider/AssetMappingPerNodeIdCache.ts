/*!
 * Copyright 2024 Cognite AS
 */
import { type AssetMapping3D } from '@cognite/sdk/dist/src';
import { type ModelTreeIndexKey } from './types';
import { type AssetMapping } from './AssetMappingAndNode3DCache';

export class AssetMappingPerNodeIdCache {
  private readonly _nodeIdsToAssetMappings = new Map<ModelTreeIndexKey, AssetMapping[]>();

  public setNodeIdsToAssetMappingCacheItem(
    key: ModelTreeIndexKey,
    item: Array<Required<AssetMapping3D>>
  ): void {
    this._nodeIdsToAssetMappings.set(key, item);
  }

  public getNodeIdsToAssetMappingCacheItem(key: ModelTreeIndexKey): AssetMapping[] | undefined {
    return this._nodeIdsToAssetMappings.get(key);
  }

  public setAssetMappingsCacheItem(key: ModelTreeIndexKey, item: AssetMapping): void {
    const currentAssetMappings = this.getNodeIdsToAssetMappingCacheItem(key);
    let assetMappings: Array<Required<AssetMapping3D>> | undefined = currentAssetMappings;

    if (assetMappings === undefined) {
      assetMappings = [item];
    } else if (
      assetMappings.find((assetMapping) => assetMapping.nodeId === item.nodeId) === undefined
    ) {
      assetMappings.push(item);
    }

    this.setNodeIdsToAssetMappingCacheItem(key, assetMappings);
  }
}
