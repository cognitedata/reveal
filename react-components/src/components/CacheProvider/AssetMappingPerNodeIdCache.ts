import { type ModelTreeIndexKey, type CdfAssetMapping } from './types';

export class AssetMappingPerNodeIdCache {
  private readonly _nodeIdsToAssetMappings = new Map<
    ModelTreeIndexKey,
    Promise<CdfAssetMapping[]>
  >();

  public setNodeIdsToAssetMappingCacheItem(
    key: ModelTreeIndexKey,
    item: Promise<CdfAssetMapping[]>
  ): void {
    this._nodeIdsToAssetMappings.set(key, Promise.resolve(item));
  }

  public async getNodeIdsToAssetMappingCacheItem(
    key: ModelTreeIndexKey
  ): Promise<CdfAssetMapping[] | undefined> {
    return await this._nodeIdsToAssetMappings.get(key);
  }

  public async setAssetMappingsCacheItem(
    key: ModelTreeIndexKey,
    item: CdfAssetMapping
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
