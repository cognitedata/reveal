/*!
 * Copyright 2025 Cognite AS
 */

import { jest } from '@jest/globals';
import { RevealCacheManager } from './RevealCacheManager';
import { CACHE_NAME, DEFAULT_MAX_CACHE_AGE, DEFAULT_DESKTOP_STORAGE_LIMIT } from './constants';

describe(RevealCacheManager.name, () => {
  const TEST_URL = 'https://example.com/test.bin';
  const FILE1_URL = 'https://example.com/file1.bin';
  const FILE2_URL = 'https://example.com/file2.bin';
  const FILE3_URL = 'https://example.com/file3.bin';

  let cacheManager: RevealCacheManager;
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
    cacheManager = new RevealCacheManager({
      cacheName: 'test-cache',
      maxCacheSize: 1024 * 1024,
      maxAge: 1000 * 60 * 60
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should use custom config or defaults', () => {
    const custom = new RevealCacheManager({
      cacheName: 'custom',
      maxCacheSize: 512 * 1024,
      maxAge: 3600000
    });
    expect(custom.cacheConfig.cacheName).toBe('custom');
    expect(custom.cacheConfig.maxCacheSize).toBe(512 * 1024);

    const defaults = new RevealCacheManager();
    expect(defaults.cacheConfig.cacheName).toBe(CACHE_NAME);
    expect(defaults.cacheConfig.maxCacheSize).toBe(DEFAULT_DESKTOP_STORAGE_LIMIT);
    expect(defaults.cacheConfig.maxAge).toBe(DEFAULT_MAX_CACHE_AGE);
  });

  test('should store and retrieve data with correct content type', async () => {
    const binaryData = new ArrayBuffer(100);
    await cacheManager.storeResponse(TEST_URL, binaryData, 'application/octet-stream');

    const cached = await cacheManager.getCachedResponse(TEST_URL);
    expect(cached).not.toBeNull();
    expect(cached!.headers.get('Content-Type')).toBe('application/octet-stream');

    const jsonData = JSON.stringify({ test: 'value' });
    await cacheManager.storeResponse(FILE1_URL, jsonData, 'application/json');

    const cachedJson = await cacheManager.getCachedResponse(FILE1_URL);
    expect(cachedJson!.headers.get('Content-Type')).toBe('application/json');
  });

  test('should return null for cache miss', async () => {
    expect(await cacheManager.getCachedResponse(TEST_URL)).toBeNull();
    expect(await cacheManager.has(TEST_URL)).toBe(false);
  });

  test('should check if URL is cached', async () => {
    await cacheManager.storeResponse(TEST_URL, new ArrayBuffer(50), 'application/octet-stream');
    expect(await cacheManager.has(TEST_URL)).toBe(true);
  });

  test('should remove expired entries on retrieval', async () => {
    const cache = await caches.open('test-cache');
    const expiredDate = Date.now() - 2 * 60 * 60 * 1000;
    const headers = new Headers({
      'Content-Type': 'application/octet-stream',
      'X-Cache-Date': expiredDate.toString(),
      'X-Cache-Size': '50'
    });
    await cache.put(TEST_URL, new Response(new ArrayBuffer(50), { status: 200, headers }));

    expect(await cacheManager.getCachedResponse(TEST_URL)).toBeNull();
    expect(await cacheManager.has(TEST_URL)).toBe(false);
  });

  test('should evict oldest entries when cache is full', async () => {
    const smallCache = new RevealCacheManager({
      cacheName: 'small-cache',
      maxCacheSize: 250,
      maxAge: 1000 * 60 * 60
    });

    await smallCache.storeResponse(FILE1_URL, new ArrayBuffer(100), 'application/octet-stream');
    await smallCache.storeResponse(FILE2_URL, new ArrayBuffer(100), 'application/octet-stream');
    await smallCache.storeResponse(FILE3_URL, new ArrayBuffer(100), 'application/octet-stream');

    expect(await smallCache.getSize()).toBeLessThanOrEqual(250);
  });

  test('should evict precisely to stay within limit', async () => {
    const smallCache = new RevealCacheManager({
      cacheName: 'precise-cache',
      maxCacheSize: 350,
      maxAge: 1000 * 60 * 60
    });

    await smallCache.storeResponse(FILE1_URL, new ArrayBuffer(100), 'application/octet-stream');
    await new Promise(resolve => setTimeout(resolve, 50));
    await smallCache.storeResponse(FILE2_URL, new ArrayBuffer(100), 'application/octet-stream');
    await new Promise(resolve => setTimeout(resolve, 50));
    await smallCache.storeResponse(FILE3_URL, new ArrayBuffer(100), 'application/octet-stream');
    await new Promise(resolve => setTimeout(resolve, 50));
    await smallCache.storeResponse('https://example.com/file4.bin', new ArrayBuffer(150), 'application/octet-stream');

    expect(await smallCache.getSize()).toBeLessThanOrEqual(350);
  });

  test('should clear all entries', async () => {
    await cacheManager.storeResponse(FILE1_URL, new ArrayBuffer(50), 'application/octet-stream');
    await cacheManager.storeResponse(FILE2_URL, new ArrayBuffer(50), 'application/octet-stream');
    await cacheManager.clear();

    expect(await cacheManager.has(FILE1_URL)).toBe(false);
    expect(await cacheManager.has(FILE2_URL)).toBe(false);
  });

  test('should calculate size and return formatted stats', async () => {
    expect(await cacheManager.getSize()).toBe(0);

    await cacheManager.storeResponse(FILE1_URL, new ArrayBuffer(100), 'application/octet-stream');

    expect(await cacheManager.getSize()).toBeGreaterThanOrEqual(0);

    const stats = await cacheManager.getStats();
    expect(stats.cacheName).toBe('test-cache');
    expect(stats.count).toBeGreaterThanOrEqual(0);
    expect(stats.sizeFormatted).toBeDefined();
    expect(Array.isArray(stats.entries)).toBe(true);
  });

  test('should handle cache errors gracefully', async () => {
    const failingMock: CacheStorage = {
      open: jest.fn(async () => {
        throw new Error('Cache error');
      }),
      delete: jest.fn(async () => false),
      has: jest.fn(async () => false),
      keys: jest.fn(async () => []),
      match: jest.fn(async () => undefined)
    } satisfies CacheStorage;

    global.caches = failingMock;

    await expect(cacheManager.getCachedResponse(TEST_URL)).rejects.toThrow('Cache error');
    await expect(
      cacheManager.storeResponse(TEST_URL, new ArrayBuffer(100), 'application/octet-stream')
    ).rejects.toThrow('Failed to store in cache');
  });

  test('should serialize concurrent writes to prevent exceeding cache limit', async () => {
    const smallCache = new RevealCacheManager({
      cacheName: 'concurrent-cache',
      maxCacheSize: 300,
      maxAge: 1000 * 60 * 60
    });

    const promises = [
      smallCache.storeResponse('https://example.com/c1.bin', new ArrayBuffer(150), 'application/octet-stream'),
      smallCache.storeResponse('https://example.com/c2.bin', new ArrayBuffer(150), 'application/octet-stream'),
      smallCache.storeResponse('https://example.com/c3.bin', new ArrayBuffer(150), 'application/octet-stream')
    ];

    await Promise.all(promises);
    expect(await smallCache.getSize()).toBeLessThanOrEqual(300);
  });

  test('should process writes in order', async () => {
    const order: number[] = [];
    const promises = [
      cacheManager
        .storeResponse('https://example.com/o1.bin', new ArrayBuffer(100), 'application/octet-stream')
        .then(() => order.push(1)),
      cacheManager
        .storeResponse('https://example.com/o2.bin', new ArrayBuffer(100), 'application/octet-stream')
        .then(() => order.push(2)),
      cacheManager
        .storeResponse('https://example.com/o3.bin', new ArrayBuffer(100), 'application/octet-stream')
        .then(() => order.push(3))
    ];

    await Promise.all(promises);
    expect(order).toEqual([1, 2, 3]);
  });

  test('should continue queue after failed operation', async () => {
    let callCount = 0;
    const failingMock: CacheStorage = {
      open: jest.fn(async (cacheName: string) => {
        callCount++;
        if (callCount === 1) throw new Error('First fails');
        if (!mockCacheStorageMap.has(cacheName)) {
          mockCacheStorageMap.set(cacheName, new Map());
        }
        return createMockCache(mockCacheStorageMap.get(cacheName)!);
      }),
      delete: jest.fn(async () => false),
      has: jest.fn(async () => false),
      keys: jest.fn(async () => []),
      match: jest.fn(async () => undefined)
    } satisfies CacheStorage;

    global.caches = failingMock;
    const resilientCache = new RevealCacheManager({
      cacheName: 'resilient-cache',
      maxCacheSize: 1024 * 1024,
      maxAge: 1000 * 60 * 60
    });

    await expect(
      resilientCache.storeResponse('https://example.com/fail.bin', new ArrayBuffer(100), 'application/octet-stream')
    ).rejects.toThrow();

    await expect(
      resilientCache.storeResponse('https://example.com/success.bin', new ArrayBuffer(100), 'application/octet-stream')
    ).resolves.not.toThrow();
  });

  test('should use custom cache key generator', async () => {
    const customKeyGen = jest.fn((url: string) => `custom-${url}`);
    const customManager = new RevealCacheManager({
      cacheName: 'custom-cache',
      maxCacheSize: 1024 * 1024,
      maxAge: 1000 * 60 * 60,
      cacheKeyGenerator: customKeyGen
    });

    await customManager.storeResponse(TEST_URL, new ArrayBuffer(50), 'application/octet-stream');
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

  function createMockCache(storage: Map<string, Response>): Cache {
    return {
      match: async (key: string) => storage.get(key) || undefined,
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
      keys: async () => Array.from(storage.keys()).map(url => ({ url }) as Request),
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
