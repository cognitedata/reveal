import { describe, it, expect, beforeEach } from 'vitest';
import { AssetMappingHybridPerAssetInstanceIdCache } from './AssetMappingHybridPerAssetInstanceIdCache';
import { type CdfAssetMapping, type ModelDMSUniqueInstanceKey } from './types';

describe(AssetMappingHybridPerAssetInstanceIdCache.name, () => {
  let cache: AssetMappingHybridPerAssetInstanceIdCache;

  const mockKey: ModelDMSUniqueInstanceKey = `123456789/987654321/space1/externalId1`;
  const mockAssetMapping1: CdfAssetMapping = {
    assetId: 1,
    treeIndex: 1,
    subtreeSize: 0,
    nodeId: 0
  };

  const mockAssetMapping2: CdfAssetMapping = {
    assetId: 2,
    treeIndex: 2,
    subtreeSize: 0,
    nodeId: 0
  };

  beforeEach(() => {
    cache = new AssetMappingHybridPerAssetInstanceIdCache();
  });

  describe('setAssetInstanceIdsToHybridAssetMappingCacheItem', () => {
    it('should set a cache item for a given key', async () => {
      cache.setAssetInstanceIdsToHybridAssetMappingCacheItem(mockKey, Promise.resolve([mockAssetMapping1]));

      const result = await cache.getAssetInstanceIdsToHybridAssetMappingCacheItem(mockKey);
      expect(result).toEqual([mockAssetMapping1]);
    });
  });

  describe('getAssetInstanceIdsToHybridAssetMappingCacheItem', () => {
    it('should return undefined if the key does not exist in the cache', async () => {
      const result = await cache.getAssetInstanceIdsToHybridAssetMappingCacheItem(mockKey);
      expect(result).toBeUndefined();
    });
  });

  describe('setHybridAssetMappingsCacheItem', () => {
    it('should add a new mapping to an existing cache item', async () => {
      cache.setAssetInstanceIdsToHybridAssetMappingCacheItem(mockKey, Promise.resolve([mockAssetMapping1]));

      await cache.setHybridAssetMappingsCacheItem(mockKey, mockAssetMapping2);

      const result = await cache.getAssetInstanceIdsToHybridAssetMappingCacheItem(mockKey);
      expect(result).toEqual([mockAssetMapping1, mockAssetMapping2]);
    });

    it('should create a new cache item if the key does not exist', async () => {
      await cache.setHybridAssetMappingsCacheItem(mockKey, mockAssetMapping1);

      const result = await cache.getAssetInstanceIdsToHybridAssetMappingCacheItem(mockKey);
      expect(result).toEqual([mockAssetMapping1]);
    });
  });

  describe('getHybridItemCacheResult', () => {
    it('should return undefined if the key does not exist in the cache', async () => {
      const result = await cache.getHybridItemCacheResult(mockKey);
      expect(result).toBeUndefined();
    });

    it('should return the cached item for a given key', async () => {
      cache.setAssetInstanceIdsToHybridAssetMappingCacheItem(mockKey, Promise.resolve([mockAssetMapping1]));

      const result = await cache.getHybridItemCacheResult(mockKey);
      expect(result).toEqual([mockAssetMapping1]);
    });
  });
});
