/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  type CdfAssetMapping,
  type ModelAssetIdKey
} from './types';
import { AssetMappingPerAssetIdCache } from './AssetMappingPerAssetIdCache';

const mockedKey: ModelAssetIdKey = '1/2/3';
const mockedAssetMapping: CdfAssetMapping = {
  nodeId: 123,
  assetId: 123,
  assetInstanceId: { space: 'test-space', externalId: 'test-external-id' },
  treeIndex: 1,
  subtreeSize: 5
};

describe(AssetMappingPerAssetIdCache.name, () => {
  let cache: AssetMappingPerAssetIdCache;

  beforeEach(() => {
    cache = new AssetMappingPerAssetIdCache();
  });

  it('should set and get an asset mapping cache item', async () => {
    cache.setAssetIdsToAssetMappingCacheItem(mockedKey, Promise.resolve([mockedAssetMapping]));
    const result = await cache.getAssetIdsToAssetMappingCacheItem(mockedKey);
    expect(result).toEqual([mockedAssetMapping]);
  });

  it('should return undefined for non-existent keys', async () => {
    const result = await cache.getAssetIdsToAssetMappingCacheItem('42/42/42');
    expect(result).toBeUndefined();
  });

  it('should add an asset mapping to an existing cache item', async () => {
    cache.setAssetIdsToAssetMappingCacheItem(mockedKey, Promise.resolve([mockedAssetMapping]));
    const newAssetMapping: CdfAssetMapping = { ...mockedAssetMapping, nodeId: 4242 };
    await cache.setAssetMappingsCacheItem(mockedKey, newAssetMapping);

    const result = await cache.getAssetIdsToAssetMappingCacheItem(mockedKey);
    expect(result).toEqual([mockedAssetMapping, newAssetMapping]);
  });
});
