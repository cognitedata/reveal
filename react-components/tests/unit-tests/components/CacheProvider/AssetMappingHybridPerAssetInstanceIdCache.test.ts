/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  type AssetMapping,
  type ModelDMSUniqueInstanceKey
} from '../../../../src/components/CacheProvider/types';
import { AssetMappingHybridPerAssetInstanceIdCache } from '../../../../src/components/CacheProvider/AssetMappingHybridPerAssetInstanceIdCache';

const mockKey: ModelDMSUniqueInstanceKey = '1/2/mock-space/mock-externalId';
const mockAssetMapping: AssetMapping = {
  nodeId: 123,
  assetId: 123,
  assetInstanceId: { space: 'mock-space', externalId: 'mock-externalId' }
};

describe('AssetMappingHybridPerAssetInstanceIdCache', () => {
  let cache: AssetMappingHybridPerAssetInstanceIdCache;

  beforeEach(() => {
    cache = new AssetMappingHybridPerAssetInstanceIdCache();
  });

  it('should set and get asset mapping cache item', async () => {
    const assetMappingPromise = Promise.resolve([mockAssetMapping]);
    cache.setAssetInstanceIdsToHybridAssetMappingCacheItem(mockKey, assetMappingPromise);

    const result = await cache.getAssetInstanceIdsToHybridAssetMappingCacheItem(mockKey);
    expect(result).toEqual([mockAssetMapping]);
  });

  it('should add an asset mapping to an existing cache entry', async () => {
    const initialAssetMapping = Promise.resolve([mockAssetMapping]);
    cache.setAssetInstanceIdsToHybridAssetMappingCacheItem(mockKey, initialAssetMapping);

    const newAssetMapping: AssetMapping = { ...mockAssetMapping, nodeId: 4242 };
    await cache.setHybridAssetMappingsCacheItem(mockKey, newAssetMapping);

    const result = await cache.getHybridItemCacheResult(mockKey);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual(mockAssetMapping);
    expect(result).toContainEqual(newAssetMapping);
  });

  it('should return undefined for non-existent keys', async () => {
    const result =
      await cache.getAssetInstanceIdsToHybridAssetMappingCacheItem('42/42/unknown/unknown');
    expect(result).toBeUndefined();
  });
});
