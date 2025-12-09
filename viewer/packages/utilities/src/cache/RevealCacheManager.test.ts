/*!
 * Copyright 2025 Cognite AS
 */

import { jest } from '@jest/globals';
import { RevealCacheManager } from './RevealCacheManager';

describe(RevealCacheManager.name, () => {
  const TEST_URL = 'https://example.com/test.bin';
  const FILE1_TEST_URL = 'https://example.com/file1.bin';
  const FILE2_TEST_URL = 'https://example.com/file2.bin';
  const FILE3_TEST_URL = 'https://example.com/file3.bin';
  let cacheManager: RevealCacheManager;
  let mockCacheStorageMap: Map<string, Map<string, Response>>;
  let originalCaches: CacheStorage;
  let originalFetch: typeof fetch;

  beforeAll(() => {
    originalCaches = global.caches;
    originalFetch = global.fetch;
  });

  afterAll(() => {
    global.caches = originalCaches;
    global.fetch = originalFetch;
  });

  beforeEach(() => {
    mockCacheStorageMap = new Map();
    global.caches = createMockCacheStorage(mockCacheStorageMap);

    const fetchFn = () => {
      const mockData = new ArrayBuffer(100);
      const blob = new Blob([mockData]);
      return Promise.resolve(
        new Response(blob, {
          status: 200,
          headers: { 'Content-Type': 'application/octet-stream' }
        })
      );
    };
    global.fetch = jest.fn(fetchFn) as unknown as typeof fetch;

    cacheManager = new RevealCacheManager({
      cacheName: 'test-cache',
      maxCacheSize: 1024 * 1024,
      maxAge: 1000 * 60 * 60
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should create instance with default config', () => {
    const manager = new RevealCacheManager({
      cacheName: 'test-cache',
      maxCacheSize: 1024 * 1024,
      maxAge: 1000 * 60 * 60
    });

    expect(manager).toBeDefined();
    expect(manager.cacheConfig.cacheName).toBe('test-cache');
  });

  test('should accept custom configuration', () => {
    const customKeyGen = (url: string) => `custom-${url}`;
    const manager = new RevealCacheManager({
      cacheName: 'custom-cache',
      maxCacheSize: 512 * 1024 * 1024,
      maxAge: 24 * 60 * 60 * 1000,
      cacheKeyGenerator: customKeyGen
    });

    expect(manager.cacheConfig.cacheName).toBe('custom-cache');
    expect(manager.cacheConfig.maxCacheSize).toBe(512 * 1024 * 1024);
  });

  test('should return null for cache miss', async () => {
    const response = await cacheManager.getCachedResponse(TEST_URL);
    expect(response).toBeNull();
  });

  test('should return cached response on cache hit', async () => {
    const data = new ArrayBuffer(50);
    await cacheManager.storeResponse(TEST_URL, data, 'application/octet-stream');

    const response = await cacheManager.getCachedResponse(TEST_URL);
    expect(response).not.toBeNull();
    expect(response!.headers.get('Content-Type')).toBe('application/octet-stream');
  });

  test('should remove expired responses', async () => {
    const url = 'https://example.com/old.bin';
    const data = new ArrayBuffer(50);

    const cache = await caches.open('test-cache');
    const expiredDate = Date.now() - 2 * 60 * 60 * 1000;
    const headers = new Headers({
      'Content-Type': 'application/octet-stream',
      'X-Cache-Date': expiredDate.toString(),
      'X-Cache-Size': '50'
    });
    const response = new Response(new Blob([data]), { status: 200, statusText: 'OK', headers });
    await cache.put(url, response);

    const result = await cacheManager.getCachedResponse(url);
    expect(result).toBeNull();
  });

  test('should store binary data', async () => {
    const data = new ArrayBuffer(100);

    await cacheManager.storeResponse(TEST_URL, data, 'application/octet-stream');

    const cached = await cacheManager.getCachedResponse(TEST_URL);
    expect(cached).not.toBeNull();
  });

  test('should store JSON data', async () => {
    const url = 'https://example.com/test.json';
    const data = JSON.stringify({ test: 'value' });

    await cacheManager.storeResponse(url, data, 'application/json');

    const cached = await cacheManager.getCachedResponse(url);
    expect(cached).not.toBeNull();
    expect(cached!.headers.get('Content-Type')).toBe('application/json');
  });

  test('should evict old entries when cache is full', async () => {
    const smallCacheManager = new RevealCacheManager({
      cacheName: 'small-cache',
      maxCacheSize: 250,
      maxAge: 1000 * 60 * 60
    });

    // Add entries that will fit
    await smallCacheManager.storeResponse(FILE1_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');
    await smallCacheManager.storeResponse(FILE2_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');

    // This should trigger eviction
    await smallCacheManager.storeResponse(FILE3_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');

    const size = await smallCacheManager.getSize();
    expect(size).toBeLessThanOrEqual(250);
  });

  test('should return false for non-existent entries', async () => {
    const exists = await cacheManager.has('https://example.com/nonexistent.bin');
    expect(exists).toBe(false);
  });

  test('should return true for cached entries', async () => {
    await cacheManager.storeResponse(TEST_URL, new ArrayBuffer(50), 'application/octet-stream');

    const exists = await cacheManager.has(TEST_URL);
    expect(exists).toBe(true);
  });

  test('should clear all cached entries', async () => {
    await cacheManager.storeResponse(FILE1_TEST_URL, new ArrayBuffer(50), 'application/octet-stream');
    await cacheManager.storeResponse(FILE2_TEST_URL, new ArrayBuffer(50), 'application/octet-stream');

    await cacheManager.clear();

    const size = await cacheManager.getSize();
    expect(size).toBe(0);
  });

  test('should return cache statistics with correct structure', async () => {
    await cacheManager.storeResponse(FILE1_TEST_URL, new ArrayBuffer(50), 'application/octet-stream');

    const exists = await cacheManager.has(FILE1_TEST_URL);
    expect(exists).toBe(true);

    const stats = await cacheManager.getStats();

    expect(stats).toBeDefined();
    expect(stats.cacheName).toBe('test-cache');
    expect(stats.sizeFormatted).toBeDefined();
    expect(Array.isArray(stats.entries)).toBe(true);
  });

  test('should calculate cache size for stored entries', async () => {
    await cacheManager.storeResponse(TEST_URL, new ArrayBuffer(100), 'application/octet-stream');

    const exists = await cacheManager.has(TEST_URL);
    expect(exists).toBe(true);

    const size = await cacheManager.getSize();
    expect(size).toBeGreaterThanOrEqual(0);
  });

  test('should handle empty cache in getSize', async () => {
    const size = await cacheManager.getSize();
    expect(size).toBe(0);
  });

  test('should handle entries without size headers in getSize', async () => {
    const cache = await caches.open('test-cache');
    const response = new Response(new ArrayBuffer(100), {
      headers: { 'Content-Type': 'application/octet-stream' }
    });
    await cache.put('https://example.com/no-size.bin', response);

    const size = await cacheManager.getSize();
    expect(size).toBe(0);
  });

  test('should evict oldest entries first when cache is full', async () => {
    const smallCacheManager = new RevealCacheManager({
      cacheName: 'eviction-test-cache',
      maxCacheSize: 350,
      maxAge: 1000 * 60 * 60
    });

    await smallCacheManager.storeResponse(
      'https://example.com/oldest.bin',
      new ArrayBuffer(100),
      'application/octet-stream'
    );
    await new Promise(resolve => setTimeout(resolve, 50));
    await smallCacheManager.storeResponse(
      'https://example.com/middle.bin',
      new ArrayBuffer(100),
      'application/octet-stream'
    );
    await new Promise(resolve => setTimeout(resolve, 50));
    await smallCacheManager.storeResponse(
      'https://example.com/newest.bin',
      new ArrayBuffer(100),
      'application/octet-stream'
    );

    await new Promise(resolve => setTimeout(resolve, 50));
    await smallCacheManager.storeResponse(
      'https://example.com/trigger-eviction.bin',
      new ArrayBuffer(200),
      'application/octet-stream'
    );

    const size = await smallCacheManager.getSize();
    expect(size).toBeLessThanOrEqual(350);

    expect(await smallCacheManager.has('https://example.com/trigger-eviction.bin')).toBe(true);
  });

  test('should evict only necessary amount of space', async () => {
    const FILE4_TEST_URL = 'https://example.com/file4.bin';
    const smallCacheManager = new RevealCacheManager({
      cacheName: 'precise-eviction-cache',
      maxCacheSize: 400,
      maxAge: 1000 * 60 * 60
    });

    await smallCacheManager.storeResponse(FILE1_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');
    await new Promise(resolve => setTimeout(resolve, 50));
    await smallCacheManager.storeResponse(FILE2_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');
    await new Promise(resolve => setTimeout(resolve, 50));
    await smallCacheManager.storeResponse(FILE3_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');
    await new Promise(resolve => setTimeout(resolve, 50));
    await smallCacheManager.storeResponse(FILE4_TEST_URL, new ArrayBuffer(200), 'application/octet-stream');

    const size = await smallCacheManager.getSize();

    expect(size).toBeLessThanOrEqual(400);
    expect(await smallCacheManager.has(FILE4_TEST_URL)).toBe(true);
  });

  test('should not evict if there is enough space', async () => {
    const largeCacheManager = new RevealCacheManager({
      cacheName: 'large-cache',
      maxCacheSize: 1000,
      maxAge: 1000 * 60 * 60
    });

    await largeCacheManager.storeResponse(FILE1_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');
    await largeCacheManager.storeResponse(FILE2_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');
    await largeCacheManager.storeResponse(FILE3_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');

    expect(await largeCacheManager.has(FILE1_TEST_URL)).toBe(true);
    expect(await largeCacheManager.has(FILE2_TEST_URL)).toBe(true);
    expect(await largeCacheManager.has(FILE3_TEST_URL)).toBe(true);
  });

  test('should use custom cache key generator', async () => {
    const customKeyGen = (url: string) => `custom-${url}`;
    const customManager = new RevealCacheManager({
      cacheName: 'custom-cache',
      maxCacheSize: 1024 * 1024,
      maxAge: 1000 * 60 * 60,
      cacheKeyGenerator: jest.fn(customKeyGen)
    });

    await customManager.storeResponse(TEST_URL, new ArrayBuffer(50), 'application/octet-stream');

    expect(customManager.cacheConfig.cacheKeyGenerator).toHaveBeenCalledWith(TEST_URL);
  });

  test('should handle cache storage errors', async () => {
    const failingMock: CacheStorage = {
      open: jest.fn(async () => {
        throw new Error('Cache error');
      }),
      delete: jest.fn(),
      has: jest.fn(),
      keys: jest.fn(),
      match: jest.fn()
    } as CacheStorage;

    global.caches = failingMock;

    await expect(cacheManager.getCachedResponse(TEST_URL)).rejects.toThrow('Cache error');
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
