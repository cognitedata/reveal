/*!
 * Copyright 2025 Cognite AS
 */
import { jest } from '@jest/globals';

export function createMockCache(storage: Map<string, Response>): Cache {
  const getKey = (key: RequestInfo | URL): string => {
    if (typeof key === 'string') return key;
    if (key instanceof Request) return key.url;
    return key.toString();
  };

  return {
    match: async (key, _options) => {
      const stored = storage.get(getKey(key));
      return stored ? stored.clone() : undefined;
    },
    matchAll: async () => {
      return Array.from(storage.values());
    },
    put: async (key, response) => {
      const responseWithUrl = response.clone();
      const keyStr = getKey(key);
      Object.defineProperty(responseWithUrl, 'url', { value: keyStr, writable: false });
      storage.set(keyStr, responseWithUrl);
    },
    delete: async key => {
      const keyStr = getKey(key);
      const had = storage.has(keyStr);
      storage.delete(keyStr);
      return had;
    },
    keys: async () => Array.from(storage.keys()).map(url => new Request(url)),
    add: jest.fn(async () => {
      throw new Error('add method not implemented in mock Cache');
    }),
    addAll: jest.fn(async () => {
      throw new Error('addAll method not implemented in mock Cache');
    })
  } satisfies Cache;
}

export function createMockCacheStorage(cacheStorageMap: Map<string, Map<string, Response>>): CacheStorage {
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
