/*!
 * Copyright 2024 Cognite AS
 */
import { type CdfAssetMapping, type ModelDMSUniqueInstanceKey } from './types';

export class AssetMappingHybridPerAssetInstanceIdCache {
  private readonly _assetInstanceIdsToHybridAssetMappings = new Map<
    ModelDMSUniqueInstanceKey,
    Promise<CdfAssetMapping[]>
  >();

  public setAssetInstanceIdsToHybridAssetMappingCacheItem(
    key: ModelDMSUniqueInstanceKey,
    item: Promise<CdfAssetMapping[]>
  ): void {
    this._assetInstanceIdsToHybridAssetMappings.set(key, item);
  }

  public async getAssetInstanceIdsToHybridAssetMappingCacheItem(
    key: ModelDMSUniqueInstanceKey
  ): Promise<CdfAssetMapping[] | undefined> {
    return await this._assetInstanceIdsToHybridAssetMappings.get(key);
  }

  public async setHybridAssetMappingsCacheItem(
    key: ModelDMSUniqueInstanceKey,
    item: CdfAssetMapping
  ): Promise<void> {
    const currentAssetMappings = await this.getAssetInstanceIdsToHybridAssetMappingCacheItem(key);
    if (currentAssetMappings === undefined) {
      this.setAssetInstanceIdsToHybridAssetMappingCacheItem(key, Promise.resolve([item]));
      return;
    }
    currentAssetMappings.push(item);
  }

  public async getHybridItemCacheResult(
    key: ModelDMSUniqueInstanceKey
  ): Promise<CdfAssetMapping[] | undefined> {
    return await this.getAssetInstanceIdsToHybridAssetMappingCacheItem(key);
  }
}
