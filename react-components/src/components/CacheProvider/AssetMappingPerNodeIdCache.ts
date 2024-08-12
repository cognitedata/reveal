/*!
 * Copyright 2024 Cognite AS
 */
import { type AssetMapping3D } from '@cognite/sdk/dist/src';
import { type ModelNodeIdKey } from './types';
import { type AssetMapping } from './AssetMappingAndNode3DCache';

export class AssetMappingPerNodeIdCache {
  private readonly _nodeIdsToAssetMappings = new Map<ModelNodeIdKey, Promise<AssetMapping[]>>();

  public setNodeIdsToAssetMappingCacheItem(
    key: ModelNodeIdKey,
    item: Promise<Array<Required<AssetMapping3D>>>
  ): void {
    this._nodeIdsToAssetMappings.set(key, Promise.resolve(item));
  }

  public async getNodeIdsToAssetMappingCacheItem(
    key: ModelNodeIdKey
  ): Promise<AssetMapping[] | undefined> {
    return await this._nodeIdsToAssetMappings.get(key);
  }

  public async setAssetMappingsCacheItem(key: ModelNodeIdKey, item: AssetMapping): Promise<void> {
    const currentAssetMappings = this.getNodeIdsToAssetMappingCacheItem(key);
    this.setNodeIdsToAssetMappingCacheItem(
      key,
      currentAssetMappings.then((value) => {
        if (value === undefined) {
          return [item];
        }
        value.push(item);
        return value;
      })
    );
  }
}
