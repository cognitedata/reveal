import { type ModelTreeIndexKey } from '../types';
import { type ClassicCadAssetMapping } from './ClassicAssetMapping';

export class ClassicCadAssetMappingPerNodeIdCache {
  private readonly _nodeIdsToAssetMappings = new Map<
    ModelTreeIndexKey,
    Promise<ClassicCadAssetMapping[]>
  >();

  public setNodeIdsToAssetMappingCacheItem(
    key: ModelTreeIndexKey,
    item: Promise<ClassicCadAssetMapping[]>
  ): void {
    this._nodeIdsToAssetMappings.set(key, Promise.resolve(item));
  }

  public async getNodeIdsToAssetMappingCacheItem(
    key: ModelTreeIndexKey
  ): Promise<ClassicCadAssetMapping[] | undefined> {
    return await this._nodeIdsToAssetMappings.get(key);
  }

  public async setAssetMappingsCacheItem(
    key: ModelTreeIndexKey,
    item: ClassicCadAssetMapping
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
