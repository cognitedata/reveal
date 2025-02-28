/*!
 * Copyright 2024 Cognite AS
 */
import { type CdfAssetMapping, type ModelAssetIdKey } from './types';

export class AssetMappingPerAssetIdCache {
  private readonly _assetIdsToAssetMappings = new Map<
    ModelAssetIdKey,
    Promise<CdfAssetMapping[]>
  >();

  public setAssetIdsToAssetMappingCacheItem(
    key: ModelAssetIdKey,
    item: Promise<Array<CdfAssetMapping>>
  ): void {
    this._assetIdsToAssetMappings.set(key, Promise.resolve(item));
  }

  public async getAssetIdsToAssetMappingCacheItem(
    key: ModelAssetIdKey
  ): Promise<CdfAssetMapping[] | undefined> {
    return await this._assetIdsToAssetMappings.get(key);
  }

  public async setAssetMappingsCacheItem(
    key: ModelAssetIdKey,
    item: CdfAssetMapping
  ): Promise<void> {
    const currentAssetMappings = this.getAssetIdsToAssetMappingCacheItem(key);
    this.setAssetIdsToAssetMappingCacheItem(
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
