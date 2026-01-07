/*!
 * Copyright 2025 Cognite AS
 */

import { ModelDataProvider } from '../ModelDataProvider';
import { BinaryFileCacheManager, CacheConfig } from '@reveal/utilities';

/**
 * Wraps a ModelDataProvider with caching capabilities using the Cache API.
 *
 * This provider intercepts getBinaryFile and getJsonFile calls and caches
 * the responses for faster subsequent access.
 */
export class CachedModelDataProvider implements ModelDataProvider {
  private readonly baseProvider: ModelDataProvider;
  private readonly cacheManager: BinaryFileCacheManager;

  constructor(baseProvider: ModelDataProvider, cacheConfig?: CacheConfig, cacheStorage?: CacheStorage) {
    this.baseProvider = baseProvider;
    this.cacheManager = new BinaryFileCacheManager(cacheConfig, cacheStorage);
  }

  async getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer> {
    const url = `${baseUrl}/${fileName}`;

    try {
      const cached = await this.cacheManager.getCachedResponse(url);
      if (cached) {
        return await cached.arrayBuffer();
      }

      const data = await this.baseProvider.getBinaryFile(baseUrl, fileName, abortSignal);

      const response = new Response(data, {
        headers: new Headers({
          'Content-Type': 'application/octet-stream',
          'Content-Length': data.byteLength.toString()
        })
      });

      this.cacheManager
        .storeResponse(url, response)
        .catch(err => console.warn('[CachedModelDataProvider] Failed to cache:', err));

      return data;
    } catch (error) {
      console.warn('[CachedModelDataProvider] Error:', error);
      return this.baseProvider.getBinaryFile(baseUrl, fileName, abortSignal);
    }
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<unknown> {
    const url = `${baseUrl}/${fileName}`;

    try {
      const cached = await this.cacheManager.getCachedResponse(url);
      if (cached) {
        return await cached.json();
      }

      const data = await this.baseProvider.getJsonFile(baseUrl, fileName);

      const jsonString = JSON.stringify(data);
      const response = new Response(jsonString, {
        headers: new Headers({
          'Content-Type': 'application/json',
          'Content-Length': new Blob([jsonString]).size.toString()
        })
      });

      this.cacheManager
        .storeResponse(url, response)
        .catch(err => console.warn('[CachedModelDataProvider] Failed to cache:', err));

      return data;
    } catch (error) {
      console.warn('[CachedModelDataProvider] Error:', error);
      return this.baseProvider.getJsonFile(baseUrl, fileName);
    }
  }

  /**
   * Get the underlying cache manager for direct cache operations
   */
  getCacheManager(): BinaryFileCacheManager {
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
