/*!
 * Copyright 2025 Cognite AS
 */
import { jest } from '@jest/globals';
import { BinaryFileCacheManager } from './BinaryFileCacheManager';
import { BINARY_FILES_CACHE_NAME } from './constants';

describe(BinaryFileCacheManager.name, () => {
  const DEFAULT_MAX_CACHE_SIZE = 1024 * 1024 * 1024; // 1GB
  const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  const TEST_CONTENT_TYPE = 'application/octet-stream';
  const TEST_FILE_URL = 'https://example.com/test.bin';

  let mockCacheStorageMap: Map<string, Map<string, Response>>;
  let mockCacheStorage: CacheStorage;
  let cacheManager: BinaryFileCacheManager;

  beforeEach(() => {
    mockCacheStorageMap = new Map();
    mockCacheStorage = createMockCacheStorage(mockCacheStorageMap);
    cacheManager = new BinaryFileCacheManager(
      {
        cacheName: 'test-cache',
        maxCacheSize: DEFAULT_MAX_CACHE_SIZE,
        maxAge: MAX_CACHE_AGE
      },
      mockCacheStorage
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should use provided config or defaults', () => {
    const custom = new BinaryFileCacheManager(
      {
        cacheName: 'custom-cache',
        maxCacheSize: 500000,
        maxAge: 3600000
      },
      mockCacheStorage
    );

    expect(custom.cacheConfig.cacheName).toBe('custom-cache');
    expect(custom.cacheConfig.maxCacheSize).toBe(500000);
    expect(custom.cacheConfig.maxAge).toBe(3600000);

    const defaults = new BinaryFileCacheManager({}, mockCacheStorage);
    expect(defaults.cacheConfig.cacheName).toBe(BINARY_FILES_CACHE_NAME);
    expect(defaults.cacheConfig.maxAge).toBe(Infinity);
  });

  test('should store and retrieve cached data', async () => {
    const data = new ArrayBuffer(100);
    await cacheManager.storeResponse(TEST_FILE_URL, createCachedResponse(data, TEST_CONTENT_TYPE));

    const hasCache = await cacheManager.has(TEST_FILE_URL);
    expect(hasCache).toBe(true);

    const cached = await cacheManager.getCachedResponse(TEST_FILE_URL);
    expect(cached).toBeDefined();
    expect(cached!.headers.get('Content-Type')).toBe(TEST_CONTENT_TYPE);

    const buffer = await cached!.arrayBuffer();
    expect(buffer.byteLength).toBe(100);
  });

  test('should return undefined for cache miss', async () => {
    const NON_EXISTENT_URL = 'https://example.com/nonexistent.bin';
    const result = await cacheManager.getCachedResponse(NON_EXISTENT_URL);
    expect(result).toBeUndefined();

    const hasCache = await cacheManager.has(NON_EXISTENT_URL);
    expect(hasCache).toBe(false);
  });

  test('should clear all cached data', async () => {
    const TEST_FILE_URL_2 = 'https://example.com/file2.bin';
    await cacheManager.storeResponse(TEST_FILE_URL, createCachedResponse(new ArrayBuffer(100), TEST_CONTENT_TYPE));
    await cacheManager.storeResponse(TEST_FILE_URL_2, createCachedResponse(new ArrayBuffer(200), TEST_CONTENT_TYPE));

    expect(await cacheManager.has(TEST_FILE_URL)).toBe(true);
    expect(await cacheManager.has(TEST_FILE_URL_2)).toBe(true);

    await cacheManager.clear();

    expect(await cacheManager.has(TEST_FILE_URL)).toBe(false);
    expect(await cacheManager.has(TEST_FILE_URL_2)).toBe(false);
  });

  test('should remove expired entries when maxAge is set', async () => {
    jest.useFakeTimers();

    const shortLivedCache = new BinaryFileCacheManager(
      {
        cacheName: 'short-cache',
        maxCacheSize: DEFAULT_MAX_CACHE_SIZE,
        maxAge: 50 // 50ms
      },
      mockCacheStorage
    );

    await shortLivedCache.storeResponse(TEST_FILE_URL, createCachedResponse(new ArrayBuffer(100), TEST_CONTENT_TYPE));

    expect(await shortLivedCache.has(TEST_FILE_URL)).toBe(true);

    jest.advanceTimersByTime(100);

    expect(await shortLivedCache.has(TEST_FILE_URL)).toBe(false);
    const cached = await shortLivedCache.getCachedResponse(TEST_FILE_URL);
    expect(cached).toBeUndefined();
  });

  test('should never expire entries when maxAge is Infinity', async () => {
    jest.useFakeTimers();

    const foreverCache = new BinaryFileCacheManager(
      {
        cacheName: 'forever-cache',
        maxCacheSize: DEFAULT_MAX_CACHE_SIZE,
        maxAge: Infinity
      },
      mockCacheStorage
    );

    await foreverCache.storeResponse(TEST_FILE_URL, createCachedResponse(new ArrayBuffer(100), TEST_CONTENT_TYPE));

    expect(await foreverCache.has(TEST_FILE_URL)).toBe(true);

    jest.advanceTimersByTime(100);

    expect(await foreverCache.has(TEST_FILE_URL)).toBe(true);
    const cached = await foreverCache.getCachedResponse(TEST_FILE_URL);
    expect(cached).toBeDefined();
  });

  test('should handle errors gracefully', async () => {
    const failingMock: CacheStorage = {
      open: jest.fn(async () => {
        throw new Error('Cache error');
      }),
      delete: jest.fn(async () => {
        throw new Error('Delete error');
      }),
      has: jest.fn(async () => false),
      keys: jest.fn(async () => []),
      match: jest.fn(async () => undefined)
    } satisfies CacheStorage;

    const errorManager = new BinaryFileCacheManager(
      {
        cacheName: 'error-cache',
        maxCacheSize: DEFAULT_MAX_CACHE_SIZE,
        maxAge: MAX_CACHE_AGE
      },
      failingMock
    );

    await expect(errorManager.getCachedResponse(TEST_FILE_URL)).rejects.toThrow('Cache error');
    await expect(
      errorManager.storeResponse(TEST_FILE_URL, createCachedResponse(new ArrayBuffer(100), TEST_CONTENT_TYPE))
    ).rejects.toThrow('Failed to store in cache');
    await expect(errorManager.clear()).rejects.toThrow('Delete error');
  });

  test('should handle invalid header values gracefully', async () => {
    const cache = await mockCacheStorage.open('test-cache');
    const INVALID_FILE_URL = 'https://example.com/invalid.bin';

    const invalidHeaders = new Headers({
      'Content-Type': TEST_CONTENT_TYPE,
      'X-Cache-Date': 'invalid-date',
      'X-Cache-Size': 'not-a-number'
    });
    await cache.put(INVALID_FILE_URL, new Response(new ArrayBuffer(100), { status: 200, headers: invalidHeaders }));

    const hasCache = await cacheManager.has(INVALID_FILE_URL);
    expect(hasCache).toBe(false);
  });

  function createCachedResponse(data: ArrayBuffer, contentType: string, url?: string): Response {
    const response = new Response(data, {
      status: 200,
      headers: new Headers({
        'Content-Type': contentType,
        'Content-Length': data.byteLength.toString()
      })
    });
    if (url) {
      Object.defineProperty(response, 'url', { value: url, writable: false });
    }
    return response;
  }

  function createMockCache(storage: Map<string, Response>): Cache {
    return {
      match: async (key: string) => storage.get(key) ?? undefined,
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
