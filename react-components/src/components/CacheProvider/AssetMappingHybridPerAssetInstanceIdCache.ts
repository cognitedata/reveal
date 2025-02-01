/*!
 * Copyright 2024 Cognite AS
 */
import { type ModelDMSUniqueInstanceKey } from './types';
import { type AssetMapping } from './AssetMappingAndNode3DCache';

export class AssetMappingHybridPerAssetInstanceIdCache {
  private readonly _assetInstanceIdsToHybridAssetMappings = new Map<
    ModelDMSUniqueInstanceKey,
    Promise<AssetMapping[]>
  >();

  public setAssetInstanceIdsToHybridAssetMappingCacheItem(
    key: ModelDMSUniqueInstanceKey,
    item: Promise<AssetMapping[]>
  ): void {
    this._assetInstanceIdsToHybridAssetMappings.set(key, Promise.resolve(item));
  }

  public async getAssetInstanceIdsToHybridAssetMappingCacheItem(
    key: ModelDMSUniqueInstanceKey
  ): Promise<AssetMapping[] | undefined> {
    return await this._assetInstanceIdsToHybridAssetMappings.get(key);
  }

  public async setHybridAssetMappingsCacheItem(
    key: ModelDMSUniqueInstanceKey,
    item: AssetMapping
  ): Promise<void> {
    const currentAssetMappings = this.getAssetInstanceIdsToHybridAssetMappingCacheItem(key);
    this.setAssetInstanceIdsToHybridAssetMappingCacheItem(
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
