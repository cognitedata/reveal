import { type ModelInstanceIdKey } from '../types';
import { type HybridCadAssetMapping } from './assetMappingTypes';

export class ClassicCadAssetMappingPerAssetIdCache {
  private readonly _assetIdsToAssetMappings = new Map<
    ModelInstanceIdKey,
    Promise<HybridCadAssetMapping[]>
  >();

  public setAssetIdsToAssetMappingCacheItem(
    key: ModelInstanceIdKey,
    item: Promise<HybridCadAssetMapping[]>
  ): void {
    this._assetIdsToAssetMappings.set(key, Promise.resolve(item));
  }

  public async getAssetIdsToAssetMappingCacheItem(
    key: ModelInstanceIdKey
  ): Promise<HybridCadAssetMapping[] | undefined> {
    return await this._assetIdsToAssetMappings.get(key);
  }

  public async setAssetMappingsCacheItem(
    key: ModelInstanceIdKey,
    item: HybridCadAssetMapping
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
