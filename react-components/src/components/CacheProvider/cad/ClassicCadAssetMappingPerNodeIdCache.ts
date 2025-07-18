import { type ModelInstanceIdKey, type ModelNodeIdKey } from '../types';
import { type HybridCadAssetMapping } from './assetMappingTypes';

export class ClassicCadAssetMappingPerNodeIdCache {
  private readonly _nodeIdsToAssetMappings = new Map<
    ModelNodeIdKey | ModelInstanceIdKey,
    Promise<HybridCadAssetMapping[]>
  >();

  public setNodeIdsToAssetMappingCacheItem(
    key: ModelNodeIdKey | ModelInstanceIdKey,
    item: Promise<HybridCadAssetMapping[]>
  ): void {
    this._nodeIdsToAssetMappings.set(key, Promise.resolve(item));
  }

  public async getNodeIdsToAssetMappingCacheItem(
    key: ModelNodeIdKey | ModelInstanceIdKey
  ): Promise<HybridCadAssetMapping[] | undefined> {
    return await this._nodeIdsToAssetMappings.get(key);
  }

  public async setAssetMappingsCacheItem(
    key: ModelNodeIdKey | ModelInstanceIdKey,
    item: HybridCadAssetMapping
  ): Promise<void> {
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
