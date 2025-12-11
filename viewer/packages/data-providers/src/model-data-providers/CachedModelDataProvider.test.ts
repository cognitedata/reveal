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
  let originalCaches: CacheStorage;

  const testBaseUrl = 'https://example.com';
  const testFileName = 'test.bin';

  beforeAll(() => {
    originalCaches = global.caches;
  });

  afterAll(() => {
    global.caches = originalCaches;
  });

  beforeEach(() => {
    mockCacheStorageMap = new Map();
    global.caches = createMockCacheStorage(mockCacheStorageMap);

    mockBaseProvider = {
      getBinaryFile: jest.fn(async () => new ArrayBuffer(100)),
      getJsonFile: jest.fn(async () => ({ test: 'data' }))
    };

    cachedProvider = new CachedModelDataProvider(mockBaseProvider, {
      cacheName: 'test-cache',
      maxCacheSize: 1024 * 1024,
      maxAge: 1000 * 60 * 60
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch from base provider on cache miss', async () => {
    const data = await cachedProvider.getBinaryFile(testBaseUrl, testFileName);

    expect(data).toBeInstanceOf(ArrayBuffer);
    expect(data.byteLength).toBe(100);
    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalledWith(testBaseUrl, testFileName, undefined);
  });

  test('should return cached data on cache hit', async () => {
    await cachedProvider.getBinaryFile(testBaseUrl, testFileName);
    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalledTimes(1);

    await new Promise(resolve => setTimeout(resolve, 50));

    const data = await cachedProvider.getBinaryFile(testBaseUrl, testFileName);
    expect(data).toBeInstanceOf(ArrayBuffer);
    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalledTimes(1);
  });

  test('should pass abort signal to base provider', async () => {
    const abortController = new AbortController();
    await cachedProvider.getBinaryFile(testBaseUrl, testFileName, abortController.signal);

    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalledWith(testBaseUrl, testFileName, abortController.signal);
  });

  test('should store data with correct content type', async () => {
    await cachedProvider.getBinaryFile(testBaseUrl, testFileName);

    await new Promise(resolve => setTimeout(resolve, 50));

    const isCached = await cachedProvider.isCached(testBaseUrl, testFileName);
    expect(isCached).toBe(true);
  });

  test('should fetch JSON from base provider on cache miss', async () => {
    const data = await cachedProvider.getJsonFile(testBaseUrl, 'test.json');

    expect(data).toEqual({ test: 'data' });
    expect(mockBaseProvider.getJsonFile).toHaveBeenCalledWith(testBaseUrl, 'test.json');
  });

  test('should return cached JSON on cache hit', async () => {
    await cachedProvider.getJsonFile(testBaseUrl, 'test.json');
    expect(mockBaseProvider.getJsonFile).toHaveBeenCalledTimes(1);

    await new Promise(resolve => setTimeout(resolve, 50));

    const data = await cachedProvider.getJsonFile(testBaseUrl, 'test.json');
    expect(data).toEqual({ test: 'data' });
    expect(mockBaseProvider.getJsonFile).toHaveBeenCalledTimes(1);
  });

  test('should return false for uncached files', async () => {
    const isCached = await cachedProvider.isCached(testBaseUrl, testFileName);
    expect(isCached).toBe(false);
  });

  test('should return true for cached files', async () => {
    await cachedProvider.getBinaryFile(testBaseUrl, testFileName);

    await new Promise(resolve => setTimeout(resolve, 50));

    const isCached = await cachedProvider.isCached(testBaseUrl, testFileName);
    expect(isCached).toBe(true);
  });

  test('should clear all cached data', async () => {
    await cachedProvider.getBinaryFile(testBaseUrl, 'file1.bin');
    await cachedProvider.getBinaryFile(testBaseUrl, 'file2.bin');

    expect(await cachedProvider.isCached(testBaseUrl, 'file1.bin')).toBe(true);
    expect(await cachedProvider.isCached(testBaseUrl, 'file2.bin')).toBe(true);

    await cachedProvider.clearCache();

    expect(await cachedProvider.isCached(testBaseUrl, 'file1.bin')).toBe(false);
    expect(await cachedProvider.isCached(testBaseUrl, 'file2.bin')).toBe(false);
  });

  test('should return cache statistics', async () => {
    await cachedProvider.getBinaryFile(testBaseUrl, 'file1.bin');
    await cachedProvider.getJsonFile(testBaseUrl, 'file2.json');

    const stats = await cachedProvider.getCacheStats();

    expect(stats).toBeDefined();
    expect(stats.cacheName).toBe('test-cache');
  });

  test('should return the underlying cache manager', () => {
    const cacheManager = cachedProvider.getCacheManager();
    expect(cacheManager).toBeDefined();
    expect(cacheManager.cacheConfig.cacheName).toBe('test-cache');
  });

  test('should handle concurrent requests for the same file', async () => {
    const promises = [
      cachedProvider.getBinaryFile(testBaseUrl, testFileName),
      cachedProvider.getBinaryFile(testBaseUrl, testFileName),
      cachedProvider.getBinaryFile(testBaseUrl, testFileName)
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

    await expect(cachedProvider.getBinaryFile(testBaseUrl, testFileName)).rejects.toThrow('Network error');
  });

  test('should warn on cache storage failures', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const failingMock: CacheStorage = {
      open: jest.fn(
        async () =>
          ({
            match: jest.fn(async () => null),
            put: jest.fn(async () => {
              throw new Error('Storage full');
            }),
            delete: jest.fn(),
            keys: jest.fn()
          }) as unknown as Cache
      ),
      delete: jest.fn(),
      has: jest.fn(),
      keys: jest.fn(),
      match: jest.fn()
    } as CacheStorage;

    global.caches = failingMock;

    await cachedProvider.getBinaryFile(testBaseUrl, testFileName);

    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  function createMockCache(storage: Map<string, Response>): Cache {
    return {
      match: async (key: string) => storage.get(key) || null,
      put: async (key: string, response: Response) => {
        storage.set(key, response);
      },
      delete: async (key: string) => {
        const had = storage.has(key);
        storage.delete(key);
        return had;
      },
      keys: async () => Array.from(storage.keys()).map(url => ({ url }) as Request)
    } as unknown as Cache;
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
      match: jest.fn()
    } as CacheStorage;
  }
});
