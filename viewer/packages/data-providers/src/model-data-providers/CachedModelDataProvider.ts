/*!
 * Copyright 2025 Cognite AS
 */

import { ModelDataProvider } from '../ModelDataProvider';
import { DataFileCacheManager, CacheConfig } from '@reveal/utilities';

/**
 * Wraps a ModelDataProvider with caching capabilities using the Cache API.
 *
 * This provider intercepts getBinaryFile and getJsonFile calls and caches
 * the responses for faster subsequent access.
 */
export class CachedModelDataProvider implements ModelDataProvider {
  private readonly baseProvider: ModelDataProvider;
  private readonly cacheManager: DataFileCacheManager;

  constructor(baseProvider: ModelDataProvider, cacheConfig?: CacheConfig, cacheStorage?: CacheStorage) {
    this.baseProvider = baseProvider;
    this.cacheManager = new DataFileCacheManager(cacheConfig, cacheStorage);
  }

  async getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer> {
    const convertToArrayBuffer = (data: ArrayBuffer): ArrayBuffer => data;

    return this.fetchWithCache(
      baseUrl,
      fileName,
      response => response.arrayBuffer(),
      () => this.baseProvider.getBinaryFile(baseUrl, fileName, abortSignal),
      convertToArrayBuffer,
      'application/octet-stream'
    );
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<unknown> {
    const convertToArrayBuffer = (data: unknown): ArrayBuffer => {
      const jsonString = JSON.stringify(data);
      return new TextEncoder().encode(jsonString).buffer;
    };

    return this.fetchWithCache(
      baseUrl,
      fileName,
      response => response.json(),
      () => this.baseProvider.getJsonFile(baseUrl, fileName),
      convertToArrayBuffer,
      'application/json'
    );
  }

  private async fetchWithCache<T>(
    baseUrl: string,
    fileName: string,
    extractFromCache: (response: Response) => Promise<T>,
    fetchFromProvider: () => Promise<T>,
    convertToArrayBuffer: (data: T) => ArrayBuffer,
    contentType: string
  ): Promise<T> {
    const url = `${baseUrl}/${fileName}`;

    try {
      const cached = await this.cacheManager.getCachedResponse(url);
      if (cached) {
        return await extractFromCache(cached);
      }
    } catch (error) {
      console.warn(`[CachedModelDataProvider] Cache read for ${url} failed, falling back to network.`, error);
    }

    const data = await fetchFromProvider();

    const arrayBuffer = convertToArrayBuffer(data);
    this.cacheManager
      .storeResponse(url, arrayBuffer, contentType)
      .catch(err => console.warn(`[CachedModelDataProvider] Failed to cache ${url}:`, err));

    return data;
  }

  /**
   * Get the underlying cache manager for direct cache operations
   */
  getCacheManager(): DataFileCacheManager {
    return this.cacheManager;
  }

  /**
   * Check if a file is cached
   */
  async isCached(baseUrl: string, fileName: string): Promise<boolean> {
    const url = `${baseUrl}/${fileName}`;
    return this.cacheManager.has(url);
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await this.cacheManager.clear();
  }
}
