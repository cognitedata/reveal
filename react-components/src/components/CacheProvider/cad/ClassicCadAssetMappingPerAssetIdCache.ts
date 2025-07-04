import { type ModelAssetIdKey } from '../types';
import { type ClassicCadAssetMapping } from './ClassicCadAssetMapping';

export class ClassicCadAssetMappingPerAssetIdCache {
  private readonly _assetIdsToAssetMappings = new Map<
    ModelAssetIdKey,
    Promise<ClassicCadAssetMapping[]>
  >();

  public setAssetIdsToAssetMappingCacheItem(
    key: ModelAssetIdKey,
    item: Promise<ClassicCadAssetMapping[]>
  ): void {
    this._assetIdsToAssetMappings.set(key, Promise.resolve(item));
  }

  public async getAssetIdsToAssetMappingCacheItem(
    key: ModelAssetIdKey
  ): Promise<ClassicCadAssetMapping[] | undefined> {
    return await this._assetIdsToAssetMappings.get(key);
  }

  public async setAssetMappingsCacheItem(
    key: ModelAssetIdKey,
    item: ClassicCadAssetMapping
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
