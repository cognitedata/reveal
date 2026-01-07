/*!
 * Copyright 2025 Cognite AS
 */

import { jest } from '@jest/globals';
import { CachedModelDataProvider } from './CachedModelDataProvider';
import { ModelDataProvider } from '../ModelDataProvider';

describe(CachedModelDataProvider.name, () => {
  let mockBaseProvider: ModelDataProvider;
  let cachedProvider: CachedModelDataProvider;
  let mockCacheStorageMap: Map<string, Map<string, Response>>;
  let mockCacheStorage: CacheStorage;

  const TEST_URL = 'https://example.com';
  const TEST_FILENAME = 'test.bin';

  beforeEach(() => {
    mockCacheStorageMap = new Map();
    mockCacheStorage = createMockCacheStorage(mockCacheStorageMap);

    mockBaseProvider = {
      getBinaryFile: jest.fn(async () => new ArrayBuffer(100)),
      getJsonFile: jest.fn(async () => ({ test: 'data' }))
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

    await new Promise(resolve => setTimeout(resolve, 50));

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

    await new Promise(resolve => setTimeout(resolve, 50));

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
    expect(mockBaseProvider.getJsonFile).toHaveBeenCalledTimes(1);

    await new Promise(resolve => setTimeout(resolve, 50));

    const data = await cachedProvider.getJsonFile(TEST_URL, 'test.json');
    expect(data).toEqual({ test: 'data' });
    expect(mockBaseProvider.getJsonFile).toHaveBeenCalledTimes(1);
  });

  test('should return false for uncached files', async () => {
    const isCached = await cachedProvider.isCached(TEST_URL, TEST_FILENAME);
    expect(isCached).toBe(false);
  });

  test('should return true for cached files', async () => {
    await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME);

    await new Promise(resolve => setTimeout(resolve, 50));

    const isCached = await cachedProvider.isCached(TEST_URL, TEST_FILENAME);
    expect(isCached).toBe(true);
  });

  test('should clear all cached data', async () => {
    const TEST_FILENAME_1 = 'file1.bin';
    const TEST_FILENAME_2 = 'file2.bin';

    await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME_1);
    await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME_2);

    await new Promise(resolve => setTimeout(resolve, 50));

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
    mockBaseProvider.getBinaryFile = jest.fn(async () => {
      throw new Error('Network error');
    });

    await expect(cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME)).rejects.toThrow('Network error');
  });

  test('should warn on cache storage failures', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const failingMock: CacheStorage = {
      open: jest.fn(
        async () =>
          ({
            match: jest.fn(async () => undefined),
            matchAll: jest.fn(async () => []),
            put: jest.fn(async () => {
              throw new Error('Storage full');
            }),
            delete: jest.fn(async () => true),
            keys: jest.fn(async () => []),
            add: jest.fn(async () => undefined),
            addAll: jest.fn(async () => undefined)
          }) satisfies Cache
      ),
      delete: jest.fn(async () => true),
      has: jest.fn(async () => false),
      keys: jest.fn(async () => []),
      match: jest.fn(async () => undefined)
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

  function createMockCache(storage: Map<string, Response>): Cache {
    return {
      match: async (key: string) => {
        const stored = storage.get(key);
        return stored ? stored.clone() : undefined;
      },
      matchAll: async () => {
        return Array.from(storage.values());
      },
      put: async (key: string, response: Response) => {
        const responseWithUrl = response.clone();
        Object.defineProperty(responseWithUrl, 'url', { value: key, writable: false });
        storage.set(key, responseWithUrl);
      },
      delete: async (key: string) => {
        const had = storage.has(key);
        storage.delete(key);
        return had;
      },
      keys: async () => Array.from(storage.keys()).map(url => new Request(url)),
      add: jest.fn(async () => undefined),
      addAll: jest.fn(async () => undefined)
    } satisfies Cache;
  }

  function createMockCacheStorage(cacheStorageMap: Map<string, Map<string, Response>>): CacheStorage {
    return {
      open: async (cacheName: string) => {
        if (!cacheStorageMap.has(cacheName)) {
          cacheStorageMap.set(cacheName, new Map());
        }
        return createMockCache(cacheStorageMap.get(cacheName)!);
      },
      delete: async (cacheName: string) => {
        const had = cacheStorageMap.has(cacheName);
        cacheStorageMap.delete(cacheName);
        return had;
      },
      has: async (cacheName: string) => cacheStorageMap.has(cacheName),
      keys: async () => Array.from(cacheStorageMap.keys()),
      match: jest.fn(async () => undefined)
    } satisfies CacheStorage;
  }
});
