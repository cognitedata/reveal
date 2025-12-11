/*!
 * Copyright 2025 Cognite AS
 */

import { ModelDataProvider } from '../ModelDataProvider';
import { RevealCacheManager, CacheConfig, CacheStats } from '@reveal/utilities';

/**
 * Wraps a ModelDataProvider with caching capabilities using the Cache API.
 *
 * This provider intercepts getBinaryFile and getJsonFile calls and caches
 * the responses for faster subsequent access.
 */
export class CachedModelDataProvider implements ModelDataProvider {
  private readonly baseProvider: ModelDataProvider;
  private readonly cacheManager: RevealCacheManager;

  constructor(baseProvider: ModelDataProvider, cacheConfig?: CacheConfig) {
    this.baseProvider = baseProvider;
    this.cacheManager = new RevealCacheManager(cacheConfig);
  }

  async getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer> {
    const url = `${baseUrl}/${fileName}`;

    try {
      const cached = await this.cacheManager.getCachedResponse(url);
      if (cached) {
        return await cached.arrayBuffer();
      }

      const data = await this.baseProvider.getBinaryFile(baseUrl, fileName, abortSignal);

      this.cacheManager
        .storeResponse(url, data, 'application/octet-stream')
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

      this.cacheManager
        .storeResponse(url, JSON.stringify(data), 'application/json')
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
  getCacheManager(): RevealCacheManager {
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

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    return this.cacheManager.getStats();
  }
}
