/*!
 * Copyright 2025 Cognite AS
 */

import { vi } from 'vitest';
import { CachedModelDataProvider } from './CachedModelDataProvider';
import type { ModelDataProvider } from '../ModelDataProvider';
import { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';
import { createMockCacheStorage } from '../../../../test-utilities/src/createCacheMocks';

describe(CachedModelDataProvider.name, () => {
  let mockBaseProvider: ModelDataProvider;
  let cachedProvider: CachedModelDataProvider;
  let mockCacheStorageMap: Map<string, Map<string, Response>>;
  let mockCacheStorage: CacheStorage;

  const TEST_URL = 'https://example.com';
  const TEST_FILENAME = 'test.bin';

  const dmIdentifier = new DMModelIdentifier({
    modelId: 1,
    revisionId: 2,
    revisionExternalId: 'ext-id',
    revisionSpace: 'my-space'
  });

  beforeEach(() => {
    mockCacheStorageMap = new Map();
    mockCacheStorage = createMockCacheStorage(mockCacheStorageMap);

    mockBaseProvider = {
      getBinaryFile: vi.fn<ModelDataProvider['getBinaryFile']>(async () => new ArrayBuffer(100)),
      getJsonFile: vi.fn<ModelDataProvider['getJsonFile']>(async () => ({ test: 'data' })),
      getSignedBinaryFile: vi.fn<ModelDataProvider['getSignedBinaryFile']>(async () => new ArrayBuffer(0)),
      getSignedJsonFile: vi.fn<ModelDataProvider['getSignedJsonFile']>(async () => ({})),
      getDMSJsonFile: vi.fn<ModelDataProvider['getDMSJsonFile']>(async () => ({
        signedFiles: { items: [] },
        fileData: {}
      })),
      getDMSJsonFileFromFileName: vi.fn<ModelDataProvider['getDMSJsonFileFromFileName']>(async () => ({}))
    };

    cachedProvider = new CachedModelDataProvider(
      mockBaseProvider,
      {
        cacheName: 'test-cache',
        maxCacheSize: 1024 * 1024,
        maxAge: 1000 * 60 * 60
      },
      mockCacheStorage
    );
  });

  test('should fetch from base provider on cache miss', async () => {
    const data = await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME);

    expect(data).toBeInstanceOf(ArrayBuffer);
    expect(data.byteLength).toBe(100);
    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalledWith(TEST_URL, TEST_FILENAME, undefined);
  });

  test('should return cached data on cache hit', async () => {
    await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME);
    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalledTimes(1);

    const data = await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME);
    expect(data).toBeInstanceOf(ArrayBuffer);
    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalledTimes(1);
  });

  test('should pass abort signal to base provider', async () => {
    const abortController = new AbortController();
    await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME, abortController.signal);

    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalledWith(TEST_URL, TEST_FILENAME, abortController.signal);
  });

  test('should store data with correct content type', async () => {
    await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME);

    const isCached = await cachedProvider.isCached(TEST_URL, TEST_FILENAME);
    expect(isCached).toBe(true);
  });

  test('should fetch JSON from base provider on cache miss', async () => {
    const data = await cachedProvider.getJsonFile(TEST_URL, 'test.json');

    expect(data).toEqual({ test: 'data' });
    expect(mockBaseProvider.getJsonFile).toHaveBeenCalledWith(TEST_URL, 'test.json');
  });

  test('should return cached JSON on cache hit', async () => {
    await cachedProvider.getJsonFile(TEST_URL, 'test.json');
    expect(mockBaseProvider.getJsonFile).toHaveBeenCalledWith(TEST_URL, 'test.json');

    const data = await cachedProvider.getJsonFile(TEST_URL, 'test.json');
    expect(data).toEqual({ test: 'data' });
  });

  test('should return false for uncached files', async () => {
    const isCached = await cachedProvider.isCached(TEST_URL, TEST_FILENAME);
    expect(isCached).toBe(false);
  });

  test('should return true for cached files', async () => {
    await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME);

    const isCached = await cachedProvider.isCached(TEST_URL, TEST_FILENAME);
    expect(isCached).toBe(true);
  });

  test('should clear all cached data', async () => {
    const TEST_FILENAME_1 = 'file1.bin';
    const TEST_FILENAME_2 = 'file2.bin';

    await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME_1);
    await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME_2);

    expect(await cachedProvider.isCached(TEST_URL, TEST_FILENAME_1)).toBe(true);
    expect(await cachedProvider.isCached(TEST_URL, TEST_FILENAME_2)).toBe(true);

    await cachedProvider.clearCache();

    expect(await cachedProvider.isCached(TEST_URL, TEST_FILENAME_1)).toBe(false);
    expect(await cachedProvider.isCached(TEST_URL, TEST_FILENAME_2)).toBe(false);
  });

  test('should return the underlying cache manager', () => {
    const cacheManager = cachedProvider.getCacheManager();
    expect(cacheManager).toBeDefined();
    expect(cacheManager.cacheConfig.cacheName).toBe('test-cache');
  });

  test('should handle concurrent requests for the same file', async () => {
    const promises = [
      cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME),
      cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME),
      cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME)
    ];

    const results = await Promise.all(promises);

    results.forEach(data => {
      expect(data).toBeInstanceOf(ArrayBuffer);
    });

    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalled();
  });

  test('should handle base provider errors', async () => {
    mockBaseProvider.getBinaryFile = vi.fn<ModelDataProvider['getBinaryFile']>(async () => {
      throw new Error('Network error');
    });

    await expect(cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME)).rejects.toThrow('Network error');
  });

  (['getDMSJsonFile', 'getDMSJsonFileFromFileName'] as const).forEach(methodName => {
    test(`${methodName} should delegate to base provider without caching`, async () => {
      await cachedProvider[methodName](TEST_URL, dmIdentifier, 'scene.json');
      await cachedProvider[methodName](TEST_URL, dmIdentifier, 'scene.json');

      expect(mockBaseProvider[methodName]).toHaveBeenCalledTimes(2);
      expect(mockBaseProvider[methodName]).toHaveBeenCalledWith(TEST_URL, dmIdentifier, 'scene.json');
    });
  });

  test('getSignedBinaryFile should delegate to base provider on every call without caching', async () => {
    const signedUrl = 'https://signed.url/file.glb';
    const abortController = new AbortController();

    const result = await cachedProvider.getSignedBinaryFile(signedUrl, abortController.signal);
    expect(mockBaseProvider.getSignedBinaryFile).toHaveBeenCalledWith(signedUrl, abortController.signal);
    expect(result).toBeInstanceOf(ArrayBuffer);

    await cachedProvider.getSignedBinaryFile(signedUrl);
    expect(mockBaseProvider.getSignedBinaryFile).toHaveBeenCalledTimes(2);
  });

  test('getSignedJsonFile should delegate to base provider', async () => {
    const signedUrl = 'https://signed.url/file.json';

    const result = await cachedProvider.getSignedJsonFile(signedUrl);

    expect(mockBaseProvider.getSignedJsonFile).toHaveBeenCalledWith(signedUrl);
    expect(result).toEqual({});
  });

  test('should warn on cache storage failures', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const failingMock: CacheStorage = {
      open: vi.fn(
        async () =>
          ({
            match: vi.fn(async () => undefined),
            matchAll: vi.fn(async () => []),
            put: vi.fn(async () => {
              throw new Error('Storage full');
            }),
            delete: vi.fn(async () => true),
            keys: vi.fn(async () => []),
            add: vi.fn(async () => undefined),
            addAll: vi.fn(async () => undefined)
          }) satisfies Cache
      ),
      delete: vi.fn(async () => true),
      has: vi.fn(async () => false),
      keys: vi.fn(async () => []),
      match: vi.fn(async () => undefined)
    } satisfies CacheStorage;

    const failingProvider = new CachedModelDataProvider(
      mockBaseProvider,
      {
        cacheName: 'failing-cache',
        maxCacheSize: 1024 * 1024,
        maxAge: 1000 * 60 * 60
      },
      failingMock
    );

    await failingProvider.getBinaryFile(TEST_URL, TEST_FILENAME);

    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});
