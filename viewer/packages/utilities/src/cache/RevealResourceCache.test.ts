/*!
 * Copyright 2025 Cognite AS
 */

import { jest } from '@jest/globals';
import {
  getRevealResourceCache,
  getRevealResourceCacheName,
  clearRevealResourceCache,
  getRevealResourceCacheSize
} from './RevealResourceCache';
import { RevealCacheManager } from './RevealCacheManager';
import { DEFAULT_MAX_CACHE_AGE, CACHE_NAME } from './constants';

describe('RevealResourceCache', () => {
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should return a CacheManager instance with auto-detected size', () => {
    const cache = getRevealResourceCache();

    expect(cache).toBeInstanceOf(RevealCacheManager);
    expect(cache.cacheConfig.cacheName).toBe(CACHE_NAME);
    expect(cache.cacheConfig.maxCacheSize).toBeGreaterThan(0); // Auto-detected based on device
  });

  test('should return the cache name', () => {
    const cacheName = getRevealResourceCacheName();
    expect(cacheName).toBe(CACHE_NAME);
  });

  test('should clear the cache', async () => {
    const cache = getRevealResourceCache();
    await cache.storeResponse('https://example.com/test.bin', new ArrayBuffer(100), 'application/octet-stream');

    expect(await cache.has('https://example.com/test.bin')).toBe(true);

    await clearRevealResourceCache();

    expect(await cache.has('https://example.com/test.bin')).toBe(false);
  });

  test('should return 0 for empty cache', async () => {
    const size = await getRevealResourceCacheSize();
    expect(size).toBe(0);
  });

  test('should handle cache read errors gracefully', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const failingMock: CacheStorage = {
      open: jest.fn(() => Promise.reject(new Error('Cache error'))),
      delete: jest.fn(),
      has: jest.fn(),
      keys: jest.fn(),
      match: jest.fn()
    } as CacheStorage;

    global.caches = failingMock;

    const size = await getRevealResourceCacheSize();

    expect(size).toBe(0);
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  test('should handle missing size headers', async () => {
    const cacheMap = mockCacheStorageMap.get(CACHE_NAME) || new Map();
    mockCacheStorageMap.set(CACHE_NAME, cacheMap);

    const response = new Response(new ArrayBuffer(100), {
      headers: {}
    });
    cacheMap.set('https://example.com/no-size.bin', response);

    const size = await getRevealResourceCacheSize();

    expect(size).toBe(0);
  });

  test('should cache different resource types in same pool', async () => {
    const cache = getRevealResourceCache();

    await cache.storeResponse('https://example.com/pointcloud.bin', new ArrayBuffer(1000), 'application/octet-stream');
    await cache.storeResponse('https://example.com/cad-model.bin', new ArrayBuffer(2000), 'application/octet-stream');
    await cache.storeResponse('https://example.com/360-image.jpg', new ArrayBuffer(3000), 'image/jpeg');

    await new Promise(resolve => setTimeout(resolve, 50));

    expect(await cache.has('https://example.com/pointcloud.bin')).toBe(true);
    expect(await cache.has('https://example.com/cad-model.bin')).toBe(true);
    expect(await cache.has('https://example.com/360-image.jpg')).toBe(true);
  });

  test('should share cache size limit across all resource types', async () => {
    // This test verifies the cache works across different resource types
    const cache = getRevealResourceCache();

    await cache.storeResponse('https://example.com/pointcloud.bin', new ArrayBuffer(1000), 'application/octet-stream');
    await cache.storeResponse('https://example.com/cad-model.bin', new ArrayBuffer(2000), 'application/octet-stream');
    await cache.storeResponse('https://example.com/360-image.jpg', new ArrayBuffer(3000), 'image/jpeg');

    await new Promise(resolve => setTimeout(resolve, 50));

    await cache.storeResponse('https://example.com/large-file.bin', new ArrayBuffer(2000), 'application/octet-stream');

    await new Promise(resolve => setTimeout(resolve, 50));

    const size = await cache.getSize();
    const maxSize = cache.cacheConfig.maxCacheSize;
    expect(maxSize).toBeDefined();
    expect(size).toBeLessThanOrEqual(maxSize!);
  });

  test('should use auto-detected cache size by default', () => {
    const cache = getRevealResourceCache();
    expect(cache.cacheConfig.maxCacheSize).toBeGreaterThan(0);
  });

  test('should use 7 days default max age', () => {
    const cache = getRevealResourceCache();
    expect(cache.cacheConfig.maxAge).toBe(DEFAULT_MAX_CACHE_AGE);
  });

  function createMockCache(storage: Map<string, Response>): Cache {
    return {
      match: async (key: string) => storage.get(key) ?? undefined,
      matchAll: async () => {
        return Array.from(storage.entries()).map(([url, response]) => {
          const clonedResponse = response.clone();
          Object.defineProperty(clonedResponse, 'url', { value: url, writable: false });
          return clonedResponse;
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
