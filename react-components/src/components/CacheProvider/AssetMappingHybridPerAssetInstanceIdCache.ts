/*!
 * Copyright 2024 Cognite AS
 */
import { type CdfAssetMapping, type ModelDMSUniqueInstanceKey } from './types';


/**
 * This class is used to cache asset mappings for hybrid asset mappings based on the unique instance DMS IDs.
 * It allows for efficient retrieval and storage of asset mappings associated with specific model instances.
 */
export class AssetMappingHybridPerAssetInstanceIdCache {
  private readonly _assetInstanceIdsToHybridAssetMappings = new Map<
    ModelDMSUniqueInstanceKey,
    Promise<CdfAssetMapping[]>
  >();

  /**
   * Sets the asset instance IDs to hybrid asset mapping cache item.
   * @param key - The unique key for the model DMS instance.
   * @param item - The promise resolving to an array of CdfAssetMapping.
   */
  public setAssetInstanceIdsToHybridAssetMappingCacheItem(
    key: ModelDMSUniqueInstanceKey,
    item: Promise<CdfAssetMapping[]>
  ): void {
    this._assetInstanceIdsToHybridAssetMappings.set(key, item);
  }

  /**
   * Retrieves the asset instance IDs to hybrid asset mapping cache item.
   * @param key - The unique key for the model DMS instance.
   * @returns A promise resolving to an array of CdfAssetMapping or undefined if not found.
   */
  public async getAssetInstanceIdsToHybridAssetMappingCacheItem(
    key: ModelDMSUniqueInstanceKey
  ): Promise<CdfAssetMapping[] | undefined> {
    return await this._assetInstanceIdsToHybridAssetMappings.get(key);
  }

  /**
   * Sets a new hybrid asset mapping cache item or appends to an existing one.
   * @param key - The unique key for the model DMS instance.
   * @param item - The CdfAssetMapping to be added.
   */
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

  /**
   * Retrieves the hybrid item cache result for a given key.
   * @param key - The unique key for the model DMS instance.
   * @returns A promise resolving to an array of CdfAssetMapping or undefined if not found.
   */
  public async getHybridItemCacheResult(
    key: ModelDMSUniqueInstanceKey
  ): Promise<CdfAssetMapping[] | undefined> {
    return await this.getAssetInstanceIdsToHybridAssetMappingCacheItem(key);
  }
}
