/*!
 * Copyright 2025 Cognite AS
 */

import { jest } from '@jest/globals';
import { BinaryFileCacheManager } from './BinaryFileCacheManager';
import { CACHE_NAME, DEFAULT_MAX_CACHE_AGE, DEFAULT_DESKTOP_STORAGE_LIMIT } from './constants';

describe(BinaryFileCacheManager.name, () => {
  const TEST_URL = 'https://example.com/test.bin';
  const FILE1_URL = 'https://example.com/file1.bin';
  const FILE2_URL = 'https://example.com/file2.bin';
  const FILE3_URL = 'https://example.com/file3.bin';

  let cacheManager: BinaryFileCacheManager;
  let mockCacheStorageMap: Map<string, Map<string, Response>>;
  let originalCaches: CacheStorage;

  beforeAll(() => {
    originalCaches = global.caches;
  });

  afterAll(() => {
    global.caches = originalCaches;
  });

  beforeEach(() => {
    mockCacheStorageMap = new Map();
    global.caches = createMockCacheStorage(mockCacheStorageMap);
    cacheManager = new BinaryFileCacheManager({
      cacheName: 'test-cache',
      maxCacheSize: 1024 * 1024,
      maxAge: 1000 * 60 * 60
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function createResponse(data: ArrayBuffer, contentType: string): Response {
    return new Response(data, {
      status: 200,
      headers: new Headers({
        'Content-Type': contentType,
        'Content-Length': data.byteLength.toString()
      })
    });
  }

  test('should use provided config or defaults', () => {
    const custom = new BinaryFileCacheManager({
      cacheName: 'custom',
      maxCacheSize: 512 * 1024,
      maxAge: 3600000
    });
    expect(custom.cacheConfig.cacheName).toBe('custom');
    expect(custom.cacheConfig.maxCacheSize).toBe(512 * 1024);

    const defaults = new BinaryFileCacheManager();
    expect(defaults.cacheConfig.cacheName).toBe(CACHE_NAME);
    expect(defaults.cacheConfig.maxCacheSize).toBe(DEFAULT_DESKTOP_STORAGE_LIMIT);
    expect(defaults.cacheConfig.maxAge).toBe(DEFAULT_MAX_CACHE_AGE);
  });

  test('should store, retrieve, check and clear cached data', async () => {
    const data = new ArrayBuffer(100);
    await cacheManager.storeResponse(TEST_URL, createResponse(data, 'application/octet-stream'));

    const cached = await cacheManager.getCachedResponse(TEST_URL);
    expect(cached).toBeDefined();
    expect(cached!.headers.get('Content-Type')).toBe('application/octet-stream');

    expect(await cacheManager.has(TEST_URL)).toBe(true);

    await cacheManager.clear();
    expect(await cacheManager.has(TEST_URL)).toBe(false);
  });

  test('should return undefined for cache miss', async () => {
    expect(await cacheManager.getCachedResponse(TEST_URL)).toBeUndefined();
    expect(await cacheManager.has(TEST_URL)).toBe(false);
  });

  test('should remove expired entries', async () => {
    const cache = await caches.open('test-cache');
    const expiredDate = Date.now() - 2 * 60 * 60 * 1000;
    const headers = new Headers({
      'Content-Type': 'application/octet-stream',
      'X-Cache-Date': expiredDate.toString(),
      'X-Cache-Size': '50'
    });
    await cache.put(TEST_URL, new Response(new ArrayBuffer(50), { status: 200, headers }));

    expect(await cacheManager.getCachedResponse(TEST_URL)).toBeUndefined();
  });

  test('should evict oldest entries when cache is full', async () => {
    const smallCache = new BinaryFileCacheManager({
      cacheName: 'small-cache',
      maxCacheSize: 250,
      maxAge: 1000 * 60 * 60
    });

    await smallCache.storeResponse(FILE1_URL, createResponse(new ArrayBuffer(100), 'application/octet-stream'));
    await smallCache.storeResponse(FILE2_URL, createResponse(new ArrayBuffer(100), 'application/octet-stream'));
    await smallCache.storeResponse(FILE3_URL, createResponse(new ArrayBuffer(100), 'application/octet-stream'));

    expect(await smallCache.getSize()).toBeLessThanOrEqual(250);
  });

  test('should evict precisely to stay within limit', async () => {
    const smallCache = new BinaryFileCacheManager({
      cacheName: 'precise-cache',
      maxCacheSize: 350,
      maxAge: 1000 * 60 * 60
    });

    await smallCache.storeResponse(FILE1_URL, createResponse(new ArrayBuffer(100), 'application/octet-stream'));
    await new Promise(resolve => setTimeout(resolve, 50));
    await smallCache.storeResponse(FILE2_URL, createResponse(new ArrayBuffer(100), 'application/octet-stream'));
    await new Promise(resolve => setTimeout(resolve, 50));
    await smallCache.storeResponse(FILE3_URL, createResponse(new ArrayBuffer(100), 'application/octet-stream'));
    await new Promise(resolve => setTimeout(resolve, 50));
    await smallCache.storeResponse(
      'https://example.com/file4.bin',
      createResponse(new ArrayBuffer(150), 'application/octet-stream')
    );

    expect(await smallCache.getSize()).toBeLessThanOrEqual(350);
  });

  test('should calculate size and return stats using in-memory index', async () => {
    expect(await cacheManager.getSize()).toBe(0);

    await cacheManager.storeResponse(FILE1_URL, createResponse(new ArrayBuffer(100), 'application/octet-stream'));
    expect(await cacheManager.getSize()).toBe(100);

    await cacheManager.storeResponse(FILE2_URL, createResponse(new ArrayBuffer(200), 'application/octet-stream'));
    expect(await cacheManager.getSize()).toBe(300);

    const stats = await cacheManager.getStats();
    expect(stats.cacheName).toBe('test-cache');
    expect(stats.count).toBe(2);
    expect(stats.size).toBe(300);
    expect(stats.sizeFormatted).toBeDefined();
    expect(Array.isArray(stats.entries)).toBe(true);
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

    global.caches = failingMock;

    const errorManager = new BinaryFileCacheManager({
      cacheName: 'error-cache',
      maxCacheSize: 1024 * 1024,
      maxAge: 1000 * 60 * 60
    });

    await expect(errorManager.getCachedResponse(TEST_URL)).rejects.toThrow('Cache error');

    const errorManager2 = new BinaryFileCacheManager({
      cacheName: 'error-cache-2',
      maxCacheSize: 1024 * 1024,
      maxAge: 1000 * 60 * 60
    });
    await expect(
      errorManager2.storeResponse(TEST_URL, createResponse(new ArrayBuffer(100), 'application/octet-stream'))
    ).rejects.toThrow('Failed to store in cache');

    const errorManager3 = new BinaryFileCacheManager({
      cacheName: 'error-cache-3',
      maxCacheSize: 1024 * 1024,
      maxAge: 1000 * 60 * 60
    });
    await expect(errorManager3.clear()).rejects.toThrow('Delete error');
  });

  test('should serialize concurrent writes to prevent race conditions', async () => {
    const smallCache = new BinaryFileCacheManager({
      cacheName: 'concurrent-cache',
      maxCacheSize: 300,
      maxAge: 1000 * 60 * 60
    });

    const promises = [
      smallCache.storeResponse(
        'https://example.com/c1.bin',
        createResponse(new ArrayBuffer(150), 'application/octet-stream')
      ),
      smallCache.storeResponse(
        'https://example.com/c2.bin',
        createResponse(new ArrayBuffer(150), 'application/octet-stream')
      ),
      smallCache.storeResponse(
        'https://example.com/c3.bin',
        createResponse(new ArrayBuffer(150), 'application/octet-stream')
      )
    ];

    await Promise.all(promises);
    expect(await smallCache.getSize()).toBeLessThanOrEqual(300);
  });

  test('should process writes in order', async () => {
    const order: number[] = [];
    const promises = [
      cacheManager
        .storeResponse('https://example.com/o1.bin', createResponse(new ArrayBuffer(100), 'application/octet-stream'))
        .then(() => order.push(1)),
      cacheManager
        .storeResponse('https://example.com/o2.bin', createResponse(new ArrayBuffer(100), 'application/octet-stream'))
        .then(() => order.push(2)),
      cacheManager
        .storeResponse('https://example.com/o3.bin', createResponse(new ArrayBuffer(100), 'application/octet-stream'))
        .then(() => order.push(3))
    ];

    await Promise.all(promises);
    expect(order).toEqual([1, 2, 3]);
  });

  test('should serialize clear() to prevent race conditions', async () => {
    const storePromises = [
      cacheManager.storeResponse(
        'https://example.com/r1.bin',
        createResponse(new ArrayBuffer(100), 'application/octet-stream')
      ),
      cacheManager.storeResponse(
        'https://example.com/r2.bin',
        createResponse(new ArrayBuffer(100), 'application/octet-stream')
      ),
      cacheManager.storeResponse(
        'https://example.com/r3.bin',
        createResponse(new ArrayBuffer(100), 'application/octet-stream')
      )
    ];

    const clearPromise = cacheManager.clear();
    await Promise.all([...storePromises, clearPromise]);

    const size = await cacheManager.getSize();
    const stats = await cacheManager.getStats();
    expect(stats.size).toBe(size);
  });

  test('should use custom cache key generator', async () => {
    const customKeyGen = jest.fn((url: string) => `custom-${url}`);
    const customManager = new BinaryFileCacheManager({
      cacheName: 'custom-cache',
      maxCacheSize: 1024 * 1024,
      maxAge: 1000 * 60 * 60,
      cacheKeyGenerator: customKeyGen
    });

    await customManager.storeResponse(TEST_URL, createResponse(new ArrayBuffer(50), 'application/octet-stream'));
    expect(customKeyGen).toHaveBeenCalledWith(TEST_URL);
  });

  test('should handle invalid header values gracefully', async () => {
    const cache = await caches.open('test-cache');

    const invalidHeaders = new Headers({
      'Content-Type': 'application/octet-stream',
      'X-Cache-Date': 'invalid-date',
      'X-Cache-Size': 'not-a-number'
    });
    await cache.put(
      'https://example.com/invalid.bin',
      new Response(new ArrayBuffer(100), { status: 200, headers: invalidHeaders })
    );

    const stats = await cacheManager.getStats();
    expect(stats).toBeDefined();
    expect(stats.count).toBeGreaterThanOrEqual(0);

    const size = await cacheManager.getSize();
    expect(size).toBeGreaterThanOrEqual(0);
  });

  test('should evict least recently used items (LRU)', async () => {
    const lruCache = new BinaryFileCacheManager({
      cacheName: 'lru-cache',
      maxCacheSize: 350,
      maxAge: 1000 * 60 * 60
    });

    // Store three files (300 bytes total, under 350 limit)
    await lruCache.storeResponse(FILE1_URL, createResponse(new ArrayBuffer(100), 'application/octet-stream'));
    await new Promise(resolve => setTimeout(resolve, 10));
    await lruCache.storeResponse(FILE2_URL, createResponse(new ArrayBuffer(100), 'application/octet-stream'));
    await new Promise(resolve => setTimeout(resolve, 10));
    await lruCache.storeResponse(FILE3_URL, createResponse(new ArrayBuffer(100), 'application/octet-stream'));

    // Access FILE1 to make it "recently used"
    await lruCache.getCachedResponse(FILE1_URL);
    await new Promise(resolve => setTimeout(resolve, 10));

    // Store a new file that will trigger eviction (400 bytes total needs to evict at least 50 bytes)
    // FILE2 should be evicted (least recently used), not FILE1 even though it was stored first
    await lruCache.storeResponse(
      'https://example.com/file4.bin',
      createResponse(new ArrayBuffer(100), 'application/octet-stream')
    );

    expect(await lruCache.has(FILE1_URL)).toBe(true);
    expect(await lruCache.has(FILE2_URL)).toBe(false);
    expect(await lruCache.has(FILE3_URL)).toBe(true);
  });

  function createMockCache(storage: Map<string, Response>): Cache {
    return {
      match: async (key: string) => storage.get(key) ?? undefined,
      matchAll: async () => {
        return Array.from(storage.entries()).map(([url, response]) => {
          const cloned = response.clone();
          Object.defineProperty(cloned, 'url', { value: url, writable: false });
          return cloned;
        });
      },
      put: async (key: string, response: Response) => {
        storage.set(key, response);
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
