/*!
 * Copyright 2025 Cognite AS
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CogniteClient } from '@cognite/sdk';
import { AssetMappingPerModelCache } from '../../../../src/components/CacheProvider/AssetMappingPerModelCache';
import { createModelRevisionKey } from '../../../../src/components/CacheProvider/idAndKeyTranslation';

vi.mock('@cognite/sdk', () => {
  return {
    CogniteClient: vi.fn().mockImplementation(() => ({
      assetMappings3D: {
        list: vi.fn(() => ({ autoPagingToArray: vi.fn(async () => await Promise.resolve([])) }))
      },
      revisions3D: {
        retrieve3DNodes: vi.fn(async () => await Promise.resolve([]))
      }
    }))
  };
});

describe('AssetMappingPerModelCache', () => {
  let sdk: CogniteClient;
  let cache: AssetMappingPerModelCache;

  const assetMappingsMock = [{ assetId: 2, nodeId: 1, treeIndex: 1, subtreeSize: 1 }];

  beforeEach(() => {
    sdk = new CogniteClient({ appId: 'test-app', project: 'test-project' });
    cache = new AssetMappingPerModelCache(sdk, false);
  });

  it('should set and get model to asset mapping cache items', async () => {
    const key = createModelRevisionKey(1, 1);
    const assetMappingsPromise = Promise.resolve(assetMappingsMock);

    cache.setModelToAssetMappingCacheItems(key, assetMappingsPromise);
    const cachedData = await cache.getModelToAssetMappingCacheItems(key);

    expect(cachedData).toEqual(await assetMappingsPromise);
  });

  it('should fetch and cache asset mappings', async () => {
    const key = createModelRevisionKey(1, 1);

    sdk.assetMappings3D.list = vi.fn(() => ({
      autoPagingToArray: vi.fn().mockResolvedValue(assetMappingsMock)
    })) as any;

    const result = await cache.fetchAndCacheMappingsForModel(1, 1);

    expect(result).toEqual(assetMappingsMock);
    expect(await cache.getModelToAssetMappingCacheItems(key)).toEqual(assetMappingsMock);
  });

  it('should return empty array if no item found', async () => {
    const result = await cache.fetchAndCacheMappingsForModel(1, 1);
    expect(result).toEqual([]);
  });
});
