/*!
 * Copyright 2025 Cognite AS
 */
import { vi } from 'vitest';
import { DataFileCacheManager } from './DataFileCacheManager';
import { BINARY_FILES_CACHE_NAME } from './constants';
import { createMockCacheStorage } from '../../../../test-utilities/src/createCacheMocks';

describe(DataFileCacheManager.name, () => {
  const DEFAULT_MAX_CACHE_SIZE = 1024 * 1024 * 1024; // 1GB
  const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  const TEST_CONTENT_TYPE = 'application/octet-stream';
  const TEST_FILE_URL = 'https://example.com/test.bin';

  let mockCacheStorageMap: Map<string, Map<string, Response>>;
  let mockCacheStorage: CacheStorage;
  let cacheManager: DataFileCacheManager;

  beforeEach(() => {
    mockCacheStorageMap = new Map();
    mockCacheStorage = createMockCacheStorage(mockCacheStorageMap);
    cacheManager = new DataFileCacheManager(
      {
        cacheName: 'test-cache',
        maxCacheSize: DEFAULT_MAX_CACHE_SIZE,
        maxAge: MAX_CACHE_AGE
      },
      mockCacheStorage
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should use provided config or defaults', () => {
    const custom = new DataFileCacheManager(
      {
        cacheName: 'custom-cache',
        maxCacheSize: 500000,
        maxAge: 3600000
      },
      mockCacheStorage
    );

    expect(custom.cacheConfig.cacheName).toBe('custom-cache');
    expect(custom.cacheConfig.maxCacheSize).toBe(500000);
    expect(custom.cacheConfig.maxAge).toBe(3600000);

    const defaults = new DataFileCacheManager({}, mockCacheStorage);
    expect(defaults.cacheConfig.cacheName).toBe(BINARY_FILES_CACHE_NAME);
    expect(defaults.cacheConfig.maxAge).toBe(Infinity);
  });

  test('should store and retrieve cached data', async () => {
    const data = new ArrayBuffer(100);
    await cacheManager.storeResponse(TEST_FILE_URL, data, TEST_CONTENT_TYPE);

    const hasCache = await cacheManager.has(TEST_FILE_URL);
    expect(hasCache).toBe(true);

    const cached = await cacheManager.getCachedResponse(TEST_FILE_URL);
    expect(cached).toBeDefined();
    expect(cached!.headers.get('Content-Type')).toBe(TEST_CONTENT_TYPE);

    const buffer = await cached!.arrayBuffer();
    expect(buffer.byteLength).toBe(100);
  });

  test('should return undefined for cache miss', async () => {
    const NON_EXISTENT_URL = 'https://example.com/nonexistent.bin';
    const result = await cacheManager.getCachedResponse(NON_EXISTENT_URL);
    expect(result).toBeUndefined();

    const hasCache = await cacheManager.has(NON_EXISTENT_URL);
    expect(hasCache).toBe(false);
  });

  test('should clear all cached data', async () => {
    const TEST_FILE_URL_2 = 'https://example.com/file2.bin';
    await cacheManager.storeResponse(TEST_FILE_URL, new ArrayBuffer(100), TEST_CONTENT_TYPE);
    await cacheManager.storeResponse(TEST_FILE_URL_2, new ArrayBuffer(200), TEST_CONTENT_TYPE);

    expect(await cacheManager.has(TEST_FILE_URL)).toBe(true);
    expect(await cacheManager.has(TEST_FILE_URL_2)).toBe(true);

    await cacheManager.clear();

    expect(await cacheManager.has(TEST_FILE_URL)).toBe(false);
    expect(await cacheManager.has(TEST_FILE_URL_2)).toBe(false);
  });

  test('should remove expired entries when maxAge is set', async () => {
    vi.useFakeTimers();

    const shortLivedCache = new DataFileCacheManager(
      {
        cacheName: 'short-cache',
        maxCacheSize: DEFAULT_MAX_CACHE_SIZE,
        maxAge: 50 // 50ms
      },
      mockCacheStorage
    );

    await shortLivedCache.storeResponse(TEST_FILE_URL, new ArrayBuffer(100), TEST_CONTENT_TYPE);

    expect(await shortLivedCache.has(TEST_FILE_URL)).toBe(true);

    vi.advanceTimersByTime(100);

    expect(await shortLivedCache.has(TEST_FILE_URL)).toBe(false);
    const cached = await shortLivedCache.getCachedResponse(TEST_FILE_URL);
    expect(cached).toBeUndefined();
  });

  test('should never expire entries when maxAge is Infinity', async () => {
    vi.useFakeTimers();

    const foreverCache = new DataFileCacheManager(
      {
        cacheName: 'forever-cache',
        maxCacheSize: DEFAULT_MAX_CACHE_SIZE,
        maxAge: Infinity
      },
      mockCacheStorage
    );

    await foreverCache.storeResponse(TEST_FILE_URL, new ArrayBuffer(100), TEST_CONTENT_TYPE);

    expect(await foreverCache.has(TEST_FILE_URL)).toBe(true);

    vi.advanceTimersByTime(100);

    expect(await foreverCache.has(TEST_FILE_URL)).toBe(true);
    const cached = await foreverCache.getCachedResponse(TEST_FILE_URL);
    expect(cached).toBeDefined();
  });

  test('should handle errors gracefully', async () => {
    const failingMock: CacheStorage = {
      open: vi.fn(async () => {
        throw new Error('Cache error');
      }),
      delete: vi.fn(async () => {
        throw new Error('Delete error');
      }),
      has: vi.fn(async () => false),
      keys: vi.fn(async () => []),
      match: vi.fn(async () => undefined)
    } satisfies CacheStorage;

    const errorManager = new DataFileCacheManager(
      {
        cacheName: 'error-cache',
        maxCacheSize: DEFAULT_MAX_CACHE_SIZE,
        maxAge: MAX_CACHE_AGE
      },
      failingMock
    );

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(errorManager.getCachedResponse(TEST_FILE_URL)).rejects.toThrow('Cache error');
    // storeResponse no longer throws — it warns on non-quota errors
    await errorManager.storeResponse(TEST_FILE_URL, new ArrayBuffer(100), TEST_CONTENT_TYPE);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[DataFileCacheManager] Failed to store in cache'));
    await expect(errorManager.clear()).rejects.toThrow('Delete error');

    warnSpy.mockRestore();
  });

  test('should handle invalid header values gracefully', async () => {
    const cache = await mockCacheStorage.open('test-cache');
    const INVALID_FILE_URL = 'https://example.com/invalid.bin';

    const invalidHeaders = new Headers({
      'Content-Type': TEST_CONTENT_TYPE,
      'X-Cache-Date': 'invalid-date',
      'X-Cache-Size': 'not-a-number'
    });
    await cache.put(INVALID_FILE_URL, new Response(new ArrayBuffer(100), { status: 200, headers: invalidHeaders }));

    const hasCache = await cacheManager.has(INVALID_FILE_URL);
    expect(hasCache).toBe(false);
  });

  describe('LRU eviction on quota exceeded', () => {
    // Wraps createMockCacheStorage and intercepts put() to throw on calls matching failPredicate.
    function createFailingPutCacheStorage(
      storageMap: Map<string, Map<string, Response>>,
      failPredicate: (callNumber: number) => boolean,
      error: unknown
    ): CacheStorage {
      let putCallCount = 0;
      const storage = createMockCacheStorage(storageMap);
      const originalOpen = storage.open.bind(storage);
      storage.open = async (cacheName: string) => {
        const cache = await originalOpen(cacheName);
        const originalPut = cache.put.bind(cache);
        cache.put = async (key: RequestInfo | URL, response: Response) => {
          putCallCount++;
          if (failPredicate(putCallCount)) throw error;
          return originalPut(key, response);
        };
        return cache;
      };
      return storage;
    }

    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      warnSpy.mockRestore();
      vi.useRealTimers();
    });

    test('should evict oldest 20% of entries on QuotaExceededError and retry', async () => {
      vi.useFakeTimers();

      const storageMap: Map<string, Map<string, Response>> = new Map();
      // Puts 1-5 succeed (storing the 5 initial entries), put 6 triggers quota
      const manager = new DataFileCacheManager(
        { cacheName: 'evict-cache' },
        createFailingPutCacheStorage(storageMap, n => n === 6, new DOMException('quota exceeded', 'QuotaExceededError'))
      );

      const urls = Array.from({ length: 5 }, (_, i) => `https://example.com/file${i}.bin`);
      for (const url of urls) {
        await manager.storeResponse(url, new ArrayBuffer(100), TEST_CONTENT_TYPE);
        vi.advanceTimersByTime(1000);
      }

      const NEW_URL = 'https://example.com/new.bin';
      await manager.storeResponse(NEW_URL, new ArrayBuffer(100), TEST_CONTENT_TYPE);

      const cache = storageMap.get('evict-cache')!;
      // 20% of 5 = 1 entry evicted — the oldest (file0)
      expect(cache.has(urls[0])).toBe(false);
      // Remaining entries untouched
      expect(cache.has(urls[1])).toBe(true);
      // New entry stored after retry
      expect(cache.has(NEW_URL)).toBe(true);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    test('should use in-memory last-accessed time for LRU ordering', async () => {
      vi.useFakeTimers();

      const storageMap: Map<string, Map<string, Response>> = new Map();
      // Puts 1-5 succeed, put 6 triggers quota
      const manager = new DataFileCacheManager(
        { cacheName: 'lru-cache' },
        createFailingPutCacheStorage(storageMap, n => n === 6, new DOMException('quota exceeded', 'QuotaExceededError'))
      );

      const [urlA, urlB, urlC, urlD, urlE] = Array.from({ length: 5 }, (_, i) => `https://example.com/file${i}.bin`);
      // Store A–E at t=0,1000,2000,3000,4000 ms — _lastAccessed mirrors store time
      for (const url of [urlA, urlB, urlC, urlD, urlE]) {
        await manager.storeResponse(url, new ArrayBuffer(100), TEST_CONTENT_TYPE);
        vi.advanceTimersByTime(1000);
      }

      // Access A at t=5000 — promotes it above B in LRU order
      await manager.getCachedResponse(urlA);
      vi.advanceTimersByTime(1000);

      // 6th put triggers quota → evicts least recently accessed (B, lastAccessed=1000)
      await manager.storeResponse('https://example.com/new.bin', new ArrayBuffer(100), TEST_CONTENT_TYPE);

      const cache = storageMap.get('lru-cache')!;
      expect(cache.has(urlB)).toBe(false); // B evicted (LRU)
      expect(cache.has(urlA)).toBe(true); // A kept (recently accessed)
      expect(warnSpy).not.toHaveBeenCalled();
    });

    test('should treat Firefox No device space error as quota error and evict', async () => {
      vi.useFakeTimers();

      const storageMap: Map<string, Map<string, Response>> = new Map();
      const manager = new DataFileCacheManager(
        { cacheName: 'ff-cache' },
        createFailingPutCacheStorage(storageMap, n => n === 6, new Error('File error: No device space'))
      );

      const urls = Array.from({ length: 5 }, (_, i) => `https://example.com/file${i}.bin`);
      for (const url of urls) {
        await manager.storeResponse(url, new ArrayBuffer(100), TEST_CONTENT_TYPE);
        vi.advanceTimersByTime(1000);
      }

      await manager.storeResponse('https://example.com/new.bin', new ArrayBuffer(100), TEST_CONTENT_TYPE);

      const cache = storageMap.get('ff-cache')!;
      // Firefox error treated as quota → eviction + retry succeeded
      expect(cache.has(urls[0])).toBe(false);
      expect(cache.has('https://example.com/new.bin')).toBe(true);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    test('should treat Safari iOS quota error as quota error and evict', async () => {
      vi.useFakeTimers();

      const storageMap: Map<string, Map<string, Response>> = new Map();
      const manager = new DataFileCacheManager(
        { cacheName: 'safari-cache' },
        createFailingPutCacheStorage(storageMap, n => n === 6, new Error('The quota has been exceeded.'))
      );

      const urls = Array.from({ length: 5 }, (_, i) => `https://example.com/file${i}.bin`);
      for (const url of urls) {
        await manager.storeResponse(url, new ArrayBuffer(100), TEST_CONTENT_TYPE);
        vi.advanceTimersByTime(1000);
      }

      await manager.storeResponse('https://example.com/new.bin', new ArrayBuffer(100), TEST_CONTENT_TYPE);

      const cache = storageMap.get('safari-cache')!;
      expect(cache.has(urls[0])).toBe(false);
      expect(cache.has('https://example.com/new.bin')).toBe(true);
      expect(warnSpy).not.toHaveBeenCalled();
    });

    test('should warn without throwing when retry still fails after eviction', async () => {
      const storageMap: Map<string, Map<string, Response>> = new Map();
      // All puts fail — eviction has nothing to clear, retry also fails
      const manager = new DataFileCacheManager(
        { cacheName: 'always-fail-cache' },
        createFailingPutCacheStorage(storageMap, () => true, new DOMException('quota exceeded', 'QuotaExceededError'))
      );

      await expect(
        manager.storeResponse('https://example.com/file.bin', new ArrayBuffer(100), TEST_CONTENT_TYPE)
      ).resolves.toBeUndefined();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[DataFileCacheManager] Failed to store in cache after LRU eviction')
      );
    });
  });
});
