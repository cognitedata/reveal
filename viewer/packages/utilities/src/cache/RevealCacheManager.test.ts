/*!
 * Copyright 2025 Cognite AS
 */

import { jest } from '@jest/globals';
import { RevealCacheManager } from './RevealCacheManager';

describe(RevealCacheManager.name, () => {
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
    const response = await cacheManager.getCachedResponse('https://example.com/test.bin');
    expect(response).toBeNull();
  });

  test('should return cached response on cache hit', async () => {
    const url = 'https://example.com/test.bin';
    const data = new ArrayBuffer(50);
    await cacheManager.storeResponse(url, data, 'application/octet-stream');

    const response = await cacheManager.getCachedResponse(url);
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
    const url = 'https://example.com/test.bin';
    const data = new ArrayBuffer(100);

    await cacheManager.storeResponse(url, data, 'application/octet-stream');

    const cached = await cacheManager.getCachedResponse(url);
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
      maxCacheSize: 200,
      maxAge: 1000 * 60 * 60
    });

    await smallCacheManager.storeResponse(
      'https://example.com/file1.bin',
      new ArrayBuffer(100),
      'application/octet-stream'
    );
    await smallCacheManager.storeResponse(
      'https://example.com/file2.bin',
      new ArrayBuffer(100),
      'application/octet-stream'
    );
    await smallCacheManager.storeResponse(
      'https://example.com/file3.bin',
      new ArrayBuffer(100),
      'application/octet-stream'
    );

    const size = await smallCacheManager.getSize();
    expect(size).toBeLessThanOrEqual(200);
  });

  test('should return false for non-existent entries', async () => {
    const exists = await cacheManager.has('https://example.com/nonexistent.bin');
    expect(exists).toBe(false);
  });

  test('should return true for cached entries', async () => {
    const url = 'https://example.com/test.bin';
    await cacheManager.storeResponse(url, new ArrayBuffer(50), 'application/octet-stream');

    const exists = await cacheManager.has(url);
    expect(exists).toBe(true);
  });

  test('should clear all cached entries', async () => {
    await cacheManager.storeResponse('https://example.com/file1.bin', new ArrayBuffer(50), 'application/octet-stream');
    await cacheManager.storeResponse('https://example.com/file2.bin', new ArrayBuffer(50), 'application/octet-stream');

    await cacheManager.clear();

    const size = await cacheManager.getSize();
    expect(size).toBe(0);
  });

  test('should return cache statistics', async () => {
    await cacheManager.storeResponse('https://example.com/file1.bin', new ArrayBuffer(50), 'application/octet-stream');
    await cacheManager.getCachedResponse('https://example.com/file1.bin');
    await cacheManager.getCachedResponse('https://example.com/nonexistent.bin');

    const stats = await cacheManager.getStats();

    expect(stats).toBeDefined();
    expect(stats.cacheName).toBe('test-cache');
  });

  test('should use custom cache key generator', async () => {
    const customKeyGen = (url: string) => `custom-${url}`;
    const customManager = new RevealCacheManager({
      cacheName: 'custom-cache',
      maxCacheSize: 1024 * 1024,
      maxAge: 1000 * 60 * 60,
      cacheKeyGenerator: jest.fn(customKeyGen)
    });

    await customManager.storeResponse('https://example.com/test.bin', new ArrayBuffer(50), 'application/octet-stream');

    expect(customManager.cacheConfig.cacheKeyGenerator).toHaveBeenCalledWith('https://example.com/test.bin');
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

    await expect(cacheManager.getCachedResponse('https://example.com/test.bin')).rejects.toThrow('Cache error');
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
