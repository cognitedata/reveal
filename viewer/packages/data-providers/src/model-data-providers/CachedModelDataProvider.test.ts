/*!
 * Copyright 2025 Cognite AS
 */

import { vi } from 'vitest';
import { CachedModelDataProvider } from './CachedModelDataProvider';
import type { ModelDataProvider } from '../ModelDataProvider';
import { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';
import { createMockCacheStorage } from '../../../../test-utilities/src/createCacheMocks';

type GetBinaryFileFn = (
  baseOrSigned: string,
  fileNameOrAbortSignal?: string | AbortSignal,
  abortSignal?: AbortSignal
) => Promise<ArrayBuffer>;
type GetJsonFileFn = (baseOrSigned: string, fileName?: string) => Promise<unknown>;

describe(CachedModelDataProvider.name, () => {
  let mockBaseProvider: ModelDataProvider;
  let cachedProvider: CachedModelDataProvider;
  let mockCacheStorageMap: Map<string, Map<string, Response>>;
  let mockCacheStorage: CacheStorage;
  let getBinaryFileMock = vi.fn<GetBinaryFileFn>();
  let getJsonFileMock = vi.fn<GetJsonFileFn>();

  const TEST_URL = 'https://example.com';
  const TEST_FILENAME = 'test.bin';

  const dmIdentifier = new DMModelIdentifier({
    modelId: 1,
    revisionId: 2,
    revisionExternalId: 'ext-id',
    revisionSpace: 'my-space'
  });

  beforeEach(() => {
    mockCacheStorageMap = new Map();
    mockCacheStorage = createMockCacheStorage(mockCacheStorageMap);

    getBinaryFileMock = vi.fn<GetBinaryFileFn>(async () => new ArrayBuffer(100));
    getJsonFileMock = vi.fn<GetJsonFileFn>(async () => ({ test: 'data' }));

    mockBaseProvider = {
      getBinaryFile: getBinaryFileMock,
      getJsonFile: getJsonFileMock,
      getFileUrlsForModel: vi.fn(async () => [])
    } as Partial<ModelDataProvider> as ModelDataProvider;

    cachedProvider = new CachedModelDataProvider(
      mockBaseProvider,
      {
        cacheName: 'test-cache',
        maxCacheSize: 1024 * 1024,
        maxAge: 1000 * 60 * 60
      },
      mockCacheStorage
    );
  });

  test('should fetch from base provider on cache miss', async () => {
    const data = await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME);

    expect(data).toBeInstanceOf(ArrayBuffer);
    expect(data.byteLength).toBe(100);
    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalledWith(TEST_URL, TEST_FILENAME, undefined);
  });

  test('should return cached data on cache hit', async () => {
    await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME);
    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalledTimes(1);

    const data = await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME);
    expect(data).toBeInstanceOf(ArrayBuffer);
    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalledTimes(1);
  });

  test('should pass abort signal to base provider', async () => {
    const abortController = new AbortController();
    await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME, abortController.signal);

    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalledWith(TEST_URL, TEST_FILENAME, abortController.signal);
  });

  test('should store data with correct content type', async () => {
    await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME);

    const isCached = await cachedProvider.isCached(TEST_URL, TEST_FILENAME);
    expect(isCached).toBe(true);
  });

  test('should fetch JSON from base provider on cache miss', async () => {
    const data = await cachedProvider.getJsonFile(TEST_URL, 'test.json');

    expect(data).toEqual({ test: 'data' });
    expect(mockBaseProvider.getJsonFile).toHaveBeenCalledWith(TEST_URL, 'test.json');
  });

  test('should return cached JSON on cache hit', async () => {
    await cachedProvider.getJsonFile(TEST_URL, 'test.json');
    expect(mockBaseProvider.getJsonFile).toHaveBeenCalledWith(TEST_URL, 'test.json');

    const data = await cachedProvider.getJsonFile(TEST_URL, 'test.json');
    expect(data).toEqual({ test: 'data' });
  });

  test('should return false for uncached files', async () => {
    const isCached = await cachedProvider.isCached(TEST_URL, TEST_FILENAME);
    expect(isCached).toBe(false);
  });

  test('should return true for cached files', async () => {
    await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME);

    const isCached = await cachedProvider.isCached(TEST_URL, TEST_FILENAME);
    expect(isCached).toBe(true);
  });

  test('should clear all cached data', async () => {
    const TEST_FILENAME_1 = 'file1.bin';
    const TEST_FILENAME_2 = 'file2.bin';

    await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME_1);
    await cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME_2);

    expect(await cachedProvider.isCached(TEST_URL, TEST_FILENAME_1)).toBe(true);
    expect(await cachedProvider.isCached(TEST_URL, TEST_FILENAME_2)).toBe(true);

    await cachedProvider.clearCache();

    expect(await cachedProvider.isCached(TEST_URL, TEST_FILENAME_1)).toBe(false);
    expect(await cachedProvider.isCached(TEST_URL, TEST_FILENAME_2)).toBe(false);
  });

  test('should return the underlying cache manager', () => {
    const cacheManager = cachedProvider.getCacheManager();
    expect(cacheManager).toBeDefined();
    expect(cacheManager.cacheConfig.cacheName).toBe('test-cache');
  });

  test('should handle concurrent requests for the same file', async () => {
    const promises = [
      cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME),
      cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME),
      cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME)
    ];

    const results = await Promise.all(promises);

    results.forEach(data => {
      expect(data).toBeInstanceOf(ArrayBuffer);
    });

    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalled();
  });

  test('should handle base provider errors', async () => {
    getBinaryFileMock.mockImplementation(async () => {
      throw new Error('Network error');
    });

    await expect(cachedProvider.getBinaryFile(TEST_URL, TEST_FILENAME)).rejects.toThrow('Network error');
  });

  test('getFileUrlsForModel should delegate to base provider without caching', async () => {
    await cachedProvider.getFileUrlsForModel(TEST_URL, dmIdentifier, 'scene.json');
    await cachedProvider.getFileUrlsForModel(TEST_URL, dmIdentifier, 'scene.json');

    expect(mockBaseProvider.getFileUrlsForModel).toHaveBeenCalledTimes(2);
    expect(mockBaseProvider.getFileUrlsForModel).toHaveBeenCalledWith(TEST_URL, dmIdentifier, 'scene.json');
  });

  test('getBinaryFile with signed URL should delegate to base provider without caching', async () => {
    const signedUrl = 'https://signed.url/file.glb';
    const abortController = new AbortController();

    const result = await cachedProvider.getBinaryFile('', signedUrl, abortController.signal);
    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalledWith('', signedUrl, abortController.signal);
    expect(result).toBeInstanceOf(ArrayBuffer);

    await cachedProvider.getBinaryFile('', signedUrl);
    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalledTimes(2);
  });

  test('getJsonFile with signed URL should delegate to base provider without caching', async () => {
    const signedUrl = 'https://signed.url/file.json';

    const result = await cachedProvider.getJsonFile('', signedUrl);

    expect(mockBaseProvider.getJsonFile).toHaveBeenCalledWith('', signedUrl);
    expect(result).toEqual({ test: 'data' });
  });

  test('should warn on cache storage failures', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const failingMock: CacheStorage = {
      open: vi.fn(
        async () =>
          ({
            match: vi.fn(async () => undefined),
            matchAll: vi.fn(async () => []),
            put: vi.fn(async () => {
              throw new Error('Storage full');
            }),
            delete: vi.fn(async () => true),
            keys: vi.fn(async () => []),
            add: vi.fn(async () => undefined),
            addAll: vi.fn(async () => undefined)
          }) satisfies Cache
      ),
      delete: vi.fn(async () => true),
      has: vi.fn(async () => false),
      keys: vi.fn(async () => []),
      match: vi.fn(async () => undefined)
    } satisfies CacheStorage;

    const failingProvider = new CachedModelDataProvider(
      mockBaseProvider,
      {
        cacheName: 'failing-cache',
        maxCacheSize: 1024 * 1024,
        maxAge: 1000 * 60 * 60
      },
      failingMock
    );

    await failingProvider.getBinaryFile(TEST_URL, TEST_FILENAME);

    expect(mockBaseProvider.getBinaryFile).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });
});
