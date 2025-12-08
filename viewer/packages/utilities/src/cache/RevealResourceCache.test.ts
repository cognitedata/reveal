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

  describe('getRevealResourceCache', () => {
    test('should return a CacheManager instance', () => {
      const cache = getRevealResourceCache();

      expect(cache).toBeInstanceOf(RevealCacheManager);
      expect(cache.cacheConfig.cacheName).toBe('reveal-3d-resources-v1');
    });

    test('should allow custom cache configuration', () => {
      const cache = getRevealResourceCache({
        maxCacheSize: 512 * 1024 * 1024,
        maxAge: 24 * 60 * 60 * 1000
      });

      expect(cache.cacheConfig.maxCacheSize).toBe(512 * 1024 * 1024);
      expect(cache.cacheConfig.maxAge).toBe(24 * 60 * 60 * 1000);
    });

    test('should allow custom cache key generator', () => {
      const customKeyGen = (url: string) => `custom-${url}`;
      const cache = getRevealResourceCache({
        cacheKeyGenerator: jest.fn(customKeyGen)
      });

      expect(cache.cacheConfig.cacheKeyGenerator).toBeDefined();
    });
  });

  describe('getRevealResourceCacheName', () => {
    test('should return the cache name', () => {
      const cacheName = getRevealResourceCacheName();
      expect(cacheName).toBe('reveal-3d-resources-v1');
    });
  });

  describe('clearRevealResourceCache', () => {
    test('should clear the cache', async () => {
      const cache = getRevealResourceCache();
      await cache.storeResponse('https://example.com/test.bin', new ArrayBuffer(100), 'application/octet-stream');

      expect(await cache.has('https://example.com/test.bin')).toBe(true);

      await clearRevealResourceCache();

      expect(await cache.has('https://example.com/test.bin')).toBe(false);
    });
  });

  describe('getRevealResourceCacheSize', () => {
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
      const cacheMap = mockCacheStorageMap.get('reveal-3d-resources-v1') || new Map();
      mockCacheStorageMap.set('reveal-3d-resources-v1', cacheMap);

      const response = new Response(new ArrayBuffer(100), {
        headers: {}
      });
      cacheMap.set('https://example.com/no-size.bin', response);

      const size = await getRevealResourceCacheSize();

      expect(size).toBe(0);
    });
  });

  describe('unified cache for multiple resource types', () => {
    test('should cache different resource types in same pool', async () => {
      const cache = getRevealResourceCache();

      await cache.storeResponse(
        'https://example.com/pointcloud.bin',
        new ArrayBuffer(1000),
        'application/octet-stream'
      );
      await cache.storeResponse('https://example.com/cad-model.bin', new ArrayBuffer(2000), 'application/octet-stream');
      await cache.storeResponse('https://example.com/360-image.jpg', new ArrayBuffer(3000), 'image/jpeg');

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(await cache.has('https://example.com/pointcloud.bin')).toBe(true);
      expect(await cache.has('https://example.com/cad-model.bin')).toBe(true);
      expect(await cache.has('https://example.com/360-image.jpg')).toBe(true);
    });

    test('should share cache size limit across all resource types', async () => {
      const cache = getRevealResourceCache({
        maxCacheSize: 5000
      });

      await cache.storeResponse(
        'https://example.com/pointcloud.bin',
        new ArrayBuffer(1000),
        'application/octet-stream'
      );
      await cache.storeResponse('https://example.com/cad-model.bin', new ArrayBuffer(2000), 'application/octet-stream');
      await cache.storeResponse('https://example.com/360-image.jpg', new ArrayBuffer(3000), 'image/jpeg');

      await new Promise(resolve => setTimeout(resolve, 50));

      await cache.storeResponse(
        'https://example.com/large-file.bin',
        new ArrayBuffer(2000),
        'application/octet-stream'
      );

      await new Promise(resolve => setTimeout(resolve, 50));

      const size = await cache.getSize();
      expect(size).toBeLessThanOrEqual(5000);
    });
  });

  describe('cache configuration', () => {
    test('should use 2GB default max cache size', () => {
      const cache = getRevealResourceCache();
      expect(cache.cacheConfig.maxCacheSize).toBe(2048 * 1024 * 1024);
    });

    test('should use 7 days default max age', () => {
      const cache = getRevealResourceCache();
      expect(cache.cacheConfig.maxAge).toBe(7 * 24 * 60 * 60 * 1000);
    });
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
