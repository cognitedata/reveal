/*!
 * Copyright 2024 Cognite AS
 */
import { type AssetMapping3D } from '@cognite/sdk/dist/src';
import { type ModelAssetIdKey } from './types';
import { type AssetMapping } from './AssetMappingAndNode3DCache';

export class AssetMappingPerAssetIdCache {
  private readonly _assetIdsToAssetMappings = new Map<ModelAssetIdKey, Promise<AssetMapping[]>>();

  public setAssetIdsToAssetMappingCacheItem(
    key: ModelAssetIdKey,
    item: Promise<Array<Required<AssetMapping3D>>>
  ): void {
    this._assetIdsToAssetMappings.set(key, Promise.resolve(item));
  }

  public async getAssetIdsToAssetMappingCacheItem(
    key: ModelAssetIdKey
  ): Promise<AssetMapping[] | undefined> {
    return await this._assetIdsToAssetMappings.get(key);
  }
}
