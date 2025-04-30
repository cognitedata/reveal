/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  type AssetMapping,
  type ModelTreeIndexKey
} from '../../../../src/components/CacheProvider/types';
import { AssetMappingPerNodeIdCache } from '../../../../src/components/CacheProvider/AssetMappingPerNodeIdCache';

// Mock data
const mockKey: ModelTreeIndexKey = '1/2/3';
const mockAssetMapping: AssetMapping = {
  nodeId: 123,
  assetId: 123,
  assetInstanceId: { space: 'test-space', externalId: 'test-external-id' },
  treeIndex: 0,
  subtreeSize: 1
};

describe('AssetMappingPerNodeIdCache', () => {
  let cache: AssetMappingPerNodeIdCache;

  beforeEach(() => {
    cache = new AssetMappingPerNodeIdCache();
  });

  it('should store and retrieve a cached asset mapping', async () => {
    cache.setNodeIdsToAssetMappingCacheItem(mockKey, Promise.resolve([mockAssetMapping]));

    const result = await cache.getNodeIdsToAssetMappingCacheItem(mockKey);
    expect(result).toEqual([mockAssetMapping]);
  });

  it('should return undefined for a non-existing key', async () => {
    const result = await cache.getNodeIdsToAssetMappingCacheItem('42/42/42');
    expect(result).toBeUndefined();
  });

  it('should append an asset mapping to an existing cache item', async () => {
    cache.setNodeIdsToAssetMappingCacheItem(mockKey, Promise.resolve([mockAssetMapping]));

    const newMapping: AssetMapping = {
      nodeId: 4242,
      assetId: 1011,
      assetInstanceId: { space: 'new-space', externalId: 'new-external-id' },
      treeIndex: 2,
      subtreeSize: 3
    };

    await cache.setAssetMappingsCacheItem(mockKey, newMapping);
    const result = await cache.getNodeIdsToAssetMappingCacheItem(mockKey);
    expect(result).toEqual([mockAssetMapping, newMapping]);
  });
});
