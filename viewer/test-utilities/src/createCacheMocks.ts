/*!
 * Copyright 2025 Cognite AS
 */
import { jest } from '@jest/globals';

export function createMockCache(storage: Map<string, Response>): Cache {
  return {
    match: async (key: string) => {
      const stored = storage.get(key);
      return stored ? stored.clone() : undefined;
    },
    matchAll: async () => {
      return Array.from(storage.values());
    },
    put: async (key: string, response: Response) => {
      const responseWithUrl = response.clone();
      Object.defineProperty(responseWithUrl, 'url', { value: key, writable: false });
      storage.set(key, responseWithUrl);
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
