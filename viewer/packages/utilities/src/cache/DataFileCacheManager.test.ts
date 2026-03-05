/*!
 * Copyright 2025 Cognite AS
 */
import { jest } from '@jest/globals';
import { DataFileCacheManager } from './DataFileCacheManager';
import { BINARY_FILES_CACHE_NAME } from './constants';
import { createMockCacheStorage } from '../../../../test-utilities/src/createCacheMocks';

describe(DataFileCacheManager.name, () => {
  const DEFAULT_MAX_CACHE_SIZE = 1024 * 1024 * 1024; // 1GB
  const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  const TEST_CONTENT_TYPE = 'application/octet-stream';
  const TEST_FILE_URL = 'https://example.com/test.bin';

  let mockCacheStorageMap: Map<string, Map<string, Response>>;
  let mockCacheStorage: CacheStorage;
  let cacheManager: DataFileCacheManager;

  beforeEach(() => {
    mockCacheStorageMap = new Map();
    mockCacheStorage = createMockCacheStorage(mockCacheStorageMap);
    cacheManager = new DataFileCacheManager(
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
    const custom = new DataFileCacheManager(
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

    const defaults = new DataFileCacheManager({}, mockCacheStorage);
    expect(defaults.cacheConfig.cacheName).toBe(BINARY_FILES_CACHE_NAME);
    expect(defaults.cacheConfig.maxAge).toBe(Infinity);
  });

  test('should store and retrieve cached data', async () => {
    const data = new ArrayBuffer(100);
    await cacheManager.storeResponse(TEST_FILE_URL, data, TEST_CONTENT_TYPE);

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
    await cacheManager.storeResponse(TEST_FILE_URL, new ArrayBuffer(100), TEST_CONTENT_TYPE);
    await cacheManager.storeResponse(TEST_FILE_URL_2, new ArrayBuffer(200), TEST_CONTENT_TYPE);

    expect(await cacheManager.has(TEST_FILE_URL)).toBe(true);
    expect(await cacheManager.has(TEST_FILE_URL_2)).toBe(true);

    await cacheManager.clear();

    expect(await cacheManager.has(TEST_FILE_URL)).toBe(false);
    expect(await cacheManager.has(TEST_FILE_URL_2)).toBe(false);
  });

  test('should remove expired entries when maxAge is set', async () => {
    jest.useFakeTimers();

    const shortLivedCache = new DataFileCacheManager(
      {
        cacheName: 'short-cache',
        maxCacheSize: DEFAULT_MAX_CACHE_SIZE,
        maxAge: 50 // 50ms
      },
      mockCacheStorage
    );

    await shortLivedCache.storeResponse(TEST_FILE_URL, new ArrayBuffer(100), TEST_CONTENT_TYPE);

    expect(await shortLivedCache.has(TEST_FILE_URL)).toBe(true);

    jest.advanceTimersByTime(100);

    expect(await shortLivedCache.has(TEST_FILE_URL)).toBe(false);
    const cached = await shortLivedCache.getCachedResponse(TEST_FILE_URL);
    expect(cached).toBeUndefined();
  });

  test('should never expire entries when maxAge is Infinity', async () => {
    jest.useFakeTimers();

    const foreverCache = new DataFileCacheManager(
      {
        cacheName: 'forever-cache',
        maxCacheSize: DEFAULT_MAX_CACHE_SIZE,
        maxAge: Infinity
      },
      mockCacheStorage
    );

    await foreverCache.storeResponse(TEST_FILE_URL, new ArrayBuffer(100), TEST_CONTENT_TYPE);

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

    const errorManager = new DataFileCacheManager(
      {
        cacheName: 'error-cache',
        maxCacheSize: DEFAULT_MAX_CACHE_SIZE,
        maxAge: MAX_CACHE_AGE
      },
      failingMock
    );

    await expect(errorManager.getCachedResponse(TEST_FILE_URL)).rejects.toThrow('Cache error');
    await expect(errorManager.storeResponse(TEST_FILE_URL, new ArrayBuffer(100), TEST_CONTENT_TYPE)).rejects.toThrow(
      'Failed to store in cache'
    );
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

  describe('pruneCache', () => {
    const storeWithDelay = async (
      cache: DataFileCacheManager,
      url: string,
      size: number,
      delayMs: number = 0
    ): Promise<void> => {
      if (delayMs > 0) jest.advanceTimersByTime(delayMs);
      await cache.storeResponse(url, new ArrayBuffer(size), TEST_CONTENT_TYPE);
    };

    beforeEach(() => {
      jest.useFakeTimers();
    });

    test('should remove expired entries by date', async () => {
      const cache = new DataFileCacheManager(
        { cacheName: 'prune-date-cache', maxCacheSize: Infinity, maxAge: 100 },
        mockCacheStorage
      );

      const url1 = 'https://example.com/file1.bin';
      const url2 = 'https://example.com/file2.bin';

      await storeWithDelay(cache, url1, 100);
      await storeWithDelay(cache, url2, 100, 50);
      jest.advanceTimersByTime(60); // url1 now expired (110ms old), url2 still valid (60ms old)

      const removed = await cache.pruneCache();

      expect(removed).toBe(1);
      expect(await cache.has(url1)).toBe(false);
      expect(await cache.has(url2)).toBe(true);
    });

    test('should remove oldest entries when cache exceeds maxCacheSize', async () => {
      const cache = new DataFileCacheManager(
        { cacheName: 'prune-size-cache', maxCacheSize: 250, maxAge: Infinity },
        mockCacheStorage
      );

      const url1 = 'https://example.com/old.bin';
      const url2 = 'https://example.com/middle.bin';
      const url3 = 'https://example.com/new.bin';

      await storeWithDelay(cache, url1, 100);
      await storeWithDelay(cache, url2, 100, 10);
      await storeWithDelay(cache, url3, 100, 10);
      // Total: 300 bytes, limit: 250 bytes

      const removed = await cache.pruneCache();

      expect(removed).toBe(1);
      expect(await cache.has(url1)).toBe(false); // Oldest, removed
      expect(await cache.has(url2)).toBe(true);
      expect(await cache.has(url3)).toBe(true);
    });

    test('should not prune when cache size is under limit', async () => {
      const cache = new DataFileCacheManager(
        { cacheName: 'prune-under-limit-cache', maxCacheSize: 500, maxAge: Infinity },
        mockCacheStorage
      );

      const url1 = 'https://example.com/file1.bin';
      const url2 = 'https://example.com/file2.bin';

      await storeWithDelay(cache, url1, 100);
      await storeWithDelay(cache, url2, 100);
      // Total: 200 bytes, limit: 500 bytes

      const removed = await cache.pruneCache();

      expect(removed).toBe(0);
      expect(await cache.has(url1)).toBe(true);
      expect(await cache.has(url2)).toBe(true);
    });

    test('should prune by both date and size', async () => {
      const cache = new DataFileCacheManager(
        { cacheName: 'prune-combined-cache', maxCacheSize: 150, maxAge: 100 },
        mockCacheStorage
      );

      const expiredUrl = 'https://example.com/expired.bin';
      const oldUrl = 'https://example.com/old.bin';
      const newUrl = 'https://example.com/new.bin';

      await storeWithDelay(cache, expiredUrl, 100);
      jest.advanceTimersByTime(150); // expiredUrl now expired
      await storeWithDelay(cache, oldUrl, 100);
      await storeWithDelay(cache, newUrl, 100, 10);
      // Non-expired total: 200 bytes, limit: 150 bytes

      const removed = await cache.pruneCache();

      expect(removed).toBe(2); // 1 expired + 1 oldest by size
      expect(await cache.has(expiredUrl)).toBe(false);
      expect(await cache.has(oldUrl)).toBe(false);
      expect(await cache.has(newUrl)).toBe(true);
    });

    test('should not prune by size when maxCacheSize is Infinity', async () => {
      const cache = new DataFileCacheManager(
        { cacheName: 'prune-infinite-size-cache', maxCacheSize: Infinity, maxAge: Infinity },
        mockCacheStorage
      );

      const url1 = 'https://example.com/file1.bin';
      const url2 = 'https://example.com/file2.bin';

      await storeWithDelay(cache, url1, 1000);
      await storeWithDelay(cache, url2, 1000);

      const removed = await cache.pruneCache();

      expect(removed).toBe(0);
      expect(await cache.has(url1)).toBe(true);
      expect(await cache.has(url2)).toBe(true);
    });
  });
});
