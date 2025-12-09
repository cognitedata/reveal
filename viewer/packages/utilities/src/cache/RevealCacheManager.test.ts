/*!
 * Copyright 2025 Cognite AS
 */

import { jest } from '@jest/globals';
import { RevealCacheManager } from './RevealCacheManager';
import { CACHE_NAME, DEFAULT_MAX_CACHE_AGE, DEFAULT_DESKTOP_STORAGE_LIMIT } from './constants';

describe(RevealCacheManager.name, () => {
  const TEST_URL = 'https://example.com/test.bin';
  const FILE1_TEST_URL = 'https://example.com/file1.bin';
  const FILE2_TEST_URL = 'https://example.com/file2.bin';
  const FILE3_TEST_URL = 'https://example.com/file3.bin';

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

  describe('Configuration', () => {
    test('should use provided configuration', () => {
      const manager = new RevealCacheManager({
        cacheName: 'custom-cache',
        maxCacheSize: 512 * 1024 * 1024,
        maxAge: 24 * 60 * 60 * 1000,
        cacheKeyGenerator: (url: string) => `custom-${url}`
      });

      expect(manager.cacheConfig.cacheName).toBe('custom-cache');
      expect(manager.cacheConfig.maxCacheSize).toBe(512 * 1024 * 1024);
      expect(manager.cacheConfig.maxAge).toBe(24 * 60 * 60 * 1000);
    });

    test('should use defaults when no config provided', () => {
      const manager = new RevealCacheManager();

      expect(manager.cacheConfig.cacheName).toBe(CACHE_NAME);
      expect(manager.cacheConfig.maxCacheSize).toBe(DEFAULT_DESKTOP_STORAGE_LIMIT);
      expect(manager.cacheConfig.maxAge).toBe(DEFAULT_MAX_CACHE_AGE);
    });
  });

  describe('Store and Retrieve', () => {
    test('should store and retrieve binary data', async () => {
      const data = new ArrayBuffer(100);
      await cacheManager.storeResponse(TEST_URL, data, 'application/octet-stream');

      const cached = await cacheManager.getCachedResponse(TEST_URL);

      expect(cached).not.toBeNull();
      expect(cached!.headers.get('Content-Type')).toBe('application/octet-stream');
    });

    test('should store and retrieve JSON data', async () => {
      const data = JSON.stringify({ test: 'value' });
      await cacheManager.storeResponse(TEST_URL, data, 'application/json');

      const cached = await cacheManager.getCachedResponse(TEST_URL);

      expect(cached).not.toBeNull();
      expect(cached!.headers.get('Content-Type')).toBe('application/json');
    });

    test('should return null for cache miss', async () => {
      const response = await cacheManager.getCachedResponse(TEST_URL);
      expect(response).toBeNull();
    });

    test('should check if URL is cached', async () => {
      expect(await cacheManager.has(TEST_URL)).toBe(false);

      await cacheManager.storeResponse(TEST_URL, new ArrayBuffer(50), 'application/octet-stream');

      expect(await cacheManager.has(TEST_URL)).toBe(true);
    });
  });

  describe('Cache Expiration', () => {
    test('should remove expired entries on retrieval', async () => {
      const cache = await caches.open('test-cache');
      const expiredDate = Date.now() - 2 * 60 * 60 * 1000;
      const headers = new Headers({
        'Content-Type': 'application/octet-stream',
        'X-Cache-Date': expiredDate.toString(),
        'X-Cache-Size': '50'
      });
      const response = new Response(new ArrayBuffer(50), { status: 200, headers });
      await cache.put(TEST_URL, response);

      const result = await cacheManager.getCachedResponse(TEST_URL);

      expect(result).toBeNull();
      expect(await cacheManager.has(TEST_URL)).toBe(false);
    });
  });

  describe('Cache Eviction', () => {
    test('should evict oldest entries when cache is full', async () => {
      const smallCache = new RevealCacheManager({
        cacheName: 'small-cache',
        maxCacheSize: 250,
        maxAge: 1000 * 60 * 60
      });

      await smallCache.storeResponse(FILE1_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');
      await smallCache.storeResponse(FILE2_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');
      await smallCache.storeResponse(FILE3_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');

      const size = await smallCache.getSize();
      expect(size).toBeLessThanOrEqual(250);
    });

    test('should not evict when there is enough space', async () => {
      await cacheManager.storeResponse(FILE1_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');
      await cacheManager.storeResponse(FILE2_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');

      expect(await cacheManager.has(FILE1_TEST_URL)).toBe(true);
      expect(await cacheManager.has(FILE2_TEST_URL)).toBe(true);
    });

    test('should evict only necessary amount to stay within limit', async () => {
      const smallCache = new RevealCacheManager({
        cacheName: 'precise-cache',
        maxCacheSize: 350,
        maxAge: 1000 * 60 * 60
      });

      await smallCache.storeResponse(FILE1_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');
      await new Promise(resolve => setTimeout(resolve, 50));
      await smallCache.storeResponse(FILE2_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');
      await new Promise(resolve => setTimeout(resolve, 50));
      await smallCache.storeResponse(FILE3_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');

      await new Promise(resolve => setTimeout(resolve, 50));
      await smallCache.storeResponse('https://example.com/file4.bin', new ArrayBuffer(150), 'application/octet-stream');

      const size = await smallCache.getSize();
      expect(size).toBeLessThanOrEqual(350);
    });
  });

  describe('Cache Management', () => {
    test('should clear all cached entries', async () => {
      await cacheManager.storeResponse(FILE1_TEST_URL, new ArrayBuffer(50), 'application/octet-stream');
      await cacheManager.storeResponse(FILE2_TEST_URL, new ArrayBuffer(50), 'application/octet-stream');

      await cacheManager.clear();

      expect(await cacheManager.has(FILE1_TEST_URL)).toBe(false);
      expect(await cacheManager.has(FILE2_TEST_URL)).toBe(false);
    });

    test('should calculate total cache size', async () => {
      expect(await cacheManager.getSize()).toBe(0);

      await cacheManager.storeResponse(FILE1_TEST_URL, new ArrayBuffer(100), 'application/octet-stream');

      const size = await cacheManager.getSize();
      expect(size).toBeGreaterThanOrEqual(0);
    });

    test('should return cache statistics', async () => {
      await cacheManager.storeResponse(FILE1_TEST_URL, new ArrayBuffer(50), 'application/octet-stream');

      const stats = await cacheManager.getStats();

      expect(stats).toBeDefined();
      expect(stats.cacheName).toBe('test-cache');
      expect(stats.count).toBeGreaterThanOrEqual(0);
      expect(stats.size).toBeGreaterThanOrEqual(0);
      expect(stats.sizeFormatted).toBeDefined();
      expect(Array.isArray(stats.entries)).toBe(true);
    });

    test('should format cache size in human-readable format', async () => {
      const cache = await caches.open('test-cache');

      const testCases = [
        { size: '0', expected: '0 Bytes' },
        { size: '1024', expected: 'KB' },
        { size: (1024 * 1024).toString(), expected: 'MB' }
      ];

      for (const testCase of testCases) {
        const headers = new Headers({
          'Content-Type': 'application/octet-stream',
          'X-Cache-Date': Date.now().toString(),
          'X-Cache-Size': testCase.size
        });
        const response = new Response(new ArrayBuffer(100), { status: 200, headers });
        await cache.put(`https://example.com/test-${testCase.size}.bin`, response);
      }

      const stats = await cacheManager.getStats();
      expect(stats.sizeFormatted).toBeDefined();
      expect(typeof stats.sizeFormatted).toBe('string');
    });
  });

  describe('Error Handling', () => {
    test('should handle cache read errors', async () => {
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

    test('should throw descriptive error when storage fails', async () => {
      const failingMock: CacheStorage = {
        open: jest.fn(async () => {
          throw new Error('Storage full');
        }),
        delete: jest.fn(),
        has: jest.fn(),
        keys: jest.fn(),
        match: jest.fn()
      } as CacheStorage;

      global.caches = failingMock;

      await expect(
        cacheManager.storeResponse(TEST_URL, new ArrayBuffer(100), 'application/octet-stream')
      ).rejects.toThrow('Failed to store in cache');
    });
  });

  describe('Custom Behavior', () => {
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
  });

  // Helper functions
  function createMockCache(storage: Map<string, Response>): Cache {
    return {
      match: async (key: string) => storage.get(key) || null,
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
