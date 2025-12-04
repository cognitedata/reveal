/*!
 * Copyright 2025 Cognite AS
 */

import { ModelDataProvider } from '../ModelDataProvider';
import { CacheManager, CacheConfig, CacheStats } from '@reveal/utilities';

/**
 * Wraps a ModelDataProvider with caching capabilities using the Cache API.
 *
 * This provider intercepts getBinaryFile and getJsonFile calls and caches
 * the responses for faster subsequent access and offline support.
 *
 * @example
 * ```typescript
 * const baseProvider = new CdfModelDataProvider(cogniteClient);
 * const cachedProvider = new CachedModelDataProvider(baseProvider, {
 *   cacheName: 'reveal-pointcloud-v1',
 *   maxCacheSize: 500 * 1024 * 1024, // 500MB
 *   maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days
 * });
 * ```
 */
export class CachedModelDataProvider implements ModelDataProvider {
  private readonly baseProvider: ModelDataProvider;
  private readonly cacheManager: CacheManager;

  constructor(baseProvider: ModelDataProvider, cacheConfig?: CacheConfig) {
    this.baseProvider = baseProvider;
    this.cacheManager = new CacheManager(cacheConfig);
  }

  async getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer> {
    const url = `${baseUrl}/${fileName}`;

    try {
      return await this.cacheManager.fetchBinary(url, { signal: abortSignal });
    } catch (error) {
      console.warn('[CachedModelDataProvider] Cache fetch failed, using base provider:', error);
      return this.baseProvider.getBinaryFile(baseUrl, fileName, abortSignal);
    }
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    const url = `${baseUrl}/${fileName}`;

    try {
      return await this.cacheManager.fetchJSON(url);
    } catch (error) {
      console.warn('[CachedModelDataProvider] Cache fetch failed, using base provider:', error);
      return this.baseProvider.getJsonFile(baseUrl, fileName);
    }
  }

  /**
   * Get the underlying cache manager for direct cache operations
   */
  getCacheManager(): CacheManager {
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

  /**
   * Print cache statistics to console
   */
  async printCacheStats(): Promise<void> {
    await this.cacheManager.printStats();
  }
}
