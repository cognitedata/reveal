/*!
 * Copyright 2024 Cognite AS
 */
import { type AssetMapping3D } from '@cognite/sdk/dist/src';
import { type ModelAssetIdKey } from './types';
import { type AssetMapping } from './AssetMappingAndNode3DCache';

export class AssetMappingPerAssetIdCache {
  private readonly _assetIdsToAssetMappings = new Map<ModelAssetIdKey, AssetMapping[]>();

  public setAssetIdsToAssetMappingCacheItem(
    key: ModelAssetIdKey,
    item: Array<Required<AssetMapping3D>>
  ): void {
    this._assetIdsToAssetMappings.set(key, item);
  }

  public getAssetIdsToAssetMappingCacheItem(key: ModelAssetIdKey): AssetMapping[] | undefined {
    return this._assetIdsToAssetMappings.get(key);
  }

  public setAssetMappingsCacheItem(key: ModelAssetIdKey, item: AssetMapping): void {
    const currentAssetMappings = this.getAssetIdsToAssetMappingCacheItem(key);
    let assetMappings: Array<Required<AssetMapping3D>> | undefined = currentAssetMappings;

    if (assetMappings === undefined) {
      assetMappings = [item];
    } else if (
      assetMappings.find((assetMapping) => assetMapping.nodeId === item.nodeId) === undefined
    ) {
      assetMappings.push(item);
    }

    this.setAssetIdsToAssetMappingCacheItem(key, assetMappings);
  }
}
