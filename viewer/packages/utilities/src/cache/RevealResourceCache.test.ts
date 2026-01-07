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
import { CACHE_NAME } from './constants';
import { BinaryFileCacheManager } from './BinaryFileCacheManager';

describe('RevealResourceCache', () => {
  const TEST_URL = 'https://example.com/test.bin';
  const TEST_POINT_CLOUD_URL = 'https://example.com/pointcloud.bin';
  const TEST_CAD_MODEL_URL = 'https://example.com/cad-model.glb';
  const TEST_360_IMAGE_URL = 'https://example.com/360-image.jpg';
  const APPLICATION_CONTENT_TYPE = 'application/octet-stream';
  const IMAGE_CONTENT_TYPE = 'image/jpeg';

  let mockCacheStorageMap: Map<string, Map<string, Response>>;
  let mockCacheStorage: CacheStorage;

  beforeEach(() => {
    mockCacheStorageMap = new Map();
    mockCacheStorage = createMockCacheStorage(mockCacheStorageMap);
  });

  test('should return a CacheManager instance with auto-detected size', () => {
    const cache = getRevealResourceCache(mockCacheStorage);

    expect(cache).toBeInstanceOf(BinaryFileCacheManager);
    expect(cache.cacheConfig.cacheName).toBe(CACHE_NAME);
    expect(cache.cacheConfig.maxCacheSize).toBe(Infinity);
  });

  test('should return the cache name', () => {
    const cacheName = getRevealResourceCacheName();
    expect(cacheName).toBe(CACHE_NAME);
  });

  test('should clear the cache', async () => {
    const cache = getRevealResourceCache(mockCacheStorage);
    await cache.storeResponse(TEST_URL, createResponse(new ArrayBuffer(100), APPLICATION_CONTENT_TYPE));

    expect(await cache.has(TEST_URL)).toBe(true);

    await clearRevealResourceCache(mockCacheStorage);

    expect(await cache.has(TEST_URL)).toBe(false);
  });

  test('should return 0 for empty cache', async () => {
    const size = await getRevealResourceCacheSize(mockCacheStorage);
    expect(size).toBe(0);
  });

  test('should handle cache read errors gracefully', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const failingMock: CacheStorage = {
      open: jest.fn(() => Promise.reject(new Error('Cache error'))),
      delete: jest.fn(async () => false),
      has: jest.fn(async () => false),
      keys: jest.fn(async () => []),
      match: jest.fn(async () => undefined)
    } satisfies CacheStorage;

    const size = await getRevealResourceCacheSize(failingMock);

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

    const size = await getRevealResourceCacheSize(mockCacheStorage);

    expect(size).toBe(0);
  });

  test('should cache different resource types in same pool', async () => {
    const cache = getRevealResourceCache(mockCacheStorage);

    await cache.storeResponse(TEST_POINT_CLOUD_URL, createResponse(new ArrayBuffer(1000), APPLICATION_CONTENT_TYPE));
    await cache.storeResponse(TEST_CAD_MODEL_URL, createResponse(new ArrayBuffer(2000), APPLICATION_CONTENT_TYPE));
    await cache.storeResponse(TEST_360_IMAGE_URL, createResponse(new ArrayBuffer(3000), IMAGE_CONTENT_TYPE));

    expect(await cache.has(TEST_POINT_CLOUD_URL)).toBe(true);
    expect(await cache.has(TEST_CAD_MODEL_URL)).toBe(true);
    expect(await cache.has(TEST_360_IMAGE_URL)).toBe(true);
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
