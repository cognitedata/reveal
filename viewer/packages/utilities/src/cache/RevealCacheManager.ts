/*!
 * Copyright 2025 Cognite AS
 */

import { BYTES_PER_KB, CACHE_NAME, DEFAULT_DESKTOP_STORAGE_LIMIT, DEFAULT_MAX_CACHE_AGE } from './constants';
import { CacheConfig, CacheStats, CacheEntry, CacheEntryMetadata } from './types';
import { safeParseInt } from './utils';

/**
 * Generic Reveal Cache Manager using the Cache API for storing 3D resources
 * Supports caching of binary files (point clouds, CAD models) and images (360 images)
 *
 * @example
 * ```typescript
 * // Create cache for point clouds
 * const pointCloudCache = new RevealCacheManager({
 *   cacheName: 'reveal-pointcloud-v1',
 *   maxCacheSize: 500 * 1024 * 1024, // 500MB
 *   maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
 *   enableMetrics: true
 * });
 * ```
 */
export class RevealCacheManager {
  private readonly _config: Required<CacheConfig>;
  private _storeQueue: Promise<void> = Promise.resolve();

  private _metadataIndex: Map<string, CacheEntryMetadata> | undefined = undefined;
  private _currentSize: number = 0;

  get cacheConfig(): CacheConfig {
    return this._config;
  }

  constructor(config: CacheConfig = {}) {
    this._config = {
      cacheName: config.cacheName ?? CACHE_NAME,
      maxCacheSize: config.maxCacheSize ?? DEFAULT_DESKTOP_STORAGE_LIMIT,
      maxAge: config.maxAge ?? DEFAULT_MAX_CACHE_AGE,
      cacheKeyGenerator: config.cacheKeyGenerator ?? ((url: string) => url)
    };
  }

  /**
   * Check if a URL is cached
   */
  async has(url: string): Promise<boolean> {
    const cacheKey = this._config.cacheKeyGenerator(url);
    const cache = await caches.open(this._config.cacheName);
    const response = await cache.match(cacheKey);

    if (!response) return false;

    return !this.isExpired(response);
  }

  /**
   * Clear all cached entries and reset the in-memory index
   */
  async clear(): Promise<void> {
    const clearOperation = this._storeQueue.then(async () => {
      await caches.delete(this._config.cacheName);
      this._metadataIndex = undefined;
      this._currentSize = 0;
    });

    this._storeQueue = clearOperation.catch(error => {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[RevealCacheManager] Clear operation failed, continuing queue:', message);
    });

    await clearOperation;
  }

  /**
   * Get a cached response if it exists and is not expired
   */
  async getCachedResponse(url: string): Promise<Response | undefined> {
    const cacheKey = this._config.cacheKeyGenerator(url);
    const cache = await caches.open(this._config.cacheName);
    const response = await cache.match(cacheKey);

    if (!response) {
      return undefined;
    }

    if (this.isExpired(response)) {
      await cache.delete(cacheKey);
      return undefined;
    }

    return response.clone();
  }

  /**
   * Initialize the in-memory metadata index by scanning the cache
   */
  private async initializeIndex(): Promise<void> {
    if (this._metadataIndex !== undefined) {
      return;
    }

    this._metadataIndex = new Map();
    this._currentSize = 0;

    const cache = await caches.open(this._config.cacheName);
    const responses = await cache.matchAll();

    for (const response of responses) {
      if (response) {
        const size = safeParseInt(response.headers.get('X-Cache-Size'));
        const date = safeParseInt(response.headers.get('X-Cache-Date'));
        const contentType = response.headers.get('Content-Type') ?? 'unknown';

        this._metadataIndex.set(response.url, { size, date, contentType });
        this._currentSize += size;
      }
    }
  }

  /**
   * Store data in cache
   */
  async storeResponse(url: string, data: ArrayBuffer | string, contentType: string): Promise<void> {
    const currentOperation = this._storeQueue.then(async () => {
      try {
        await this.initializeIndex();

        const cacheKey = this._config.cacheKeyGenerator(url);

        const blob = new Blob([data], { type: contentType });
        const size = blob.size;

        await this.evictIfNeeded(size);

        const cache = await caches.open(this._config.cacheName);

        const now = Date.now();
        const headers = new Headers({
          'Content-Type': contentType,
          'X-Cache-Date': now.toString(),
          'X-Cache-Size': size.toString()
        });

        const response = new Response(blob, {
          status: 200,
          statusText: 'OK',
          headers
        });

        await cache.put(cacheKey, response);

        this._metadataIndex?.set(cacheKey, { size, date: now, contentType });
        this._currentSize += size;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`[RevealCacheManager] Failed to store in cache: ${message}`, { cause: error });
      }
    });

    this._storeQueue = currentOperation.catch(error => {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[RevealCacheManager] Store operation failed, continuing queue:', message);
    });

    await currentOperation;
  }

  /**
   * Get current cache size in bytes
   */
  async getSize(): Promise<number> {
    await this.initializeIndex();
    return this._currentSize;
  }

  /**
   * Get detailed cache statistics
   */
  async getStats(): Promise<CacheStats> {
    await this.initializeIndex();

    const entries: CacheEntry[] = [];
    let totalSize = 0;

    for (const [cacheKey, metadata] of this._metadataIndex?.entries() ?? []) {
      const cachedAt = new Date(metadata.date);
      const expiresAt = new Date(cachedAt.getTime() + this._config.maxAge);

      totalSize += metadata.size;
      entries.push({
        cacheKey,
        size: metadata.size,
        cachedAt,
        expiresAt,
        contentType: metadata.contentType
      });
    }

    return {
      cacheName: this._config.cacheName,
      count: entries.length,
      size: totalSize,
      sizeFormatted: this.formatBytes(totalSize),
      entries: entries.sort((a, b) => b.cachedAt.getTime() - a.cachedAt.getTime())
    };
  }

  /**
   * Evict entries if needed to make space for a new entry
   */
  private async evictIfNeeded(newEntrySize: number): Promise<void> {
    await this.initializeIndex();

    if (this._currentSize + newEntrySize <= this._config.maxCacheSize) {
      return;
    }

    const cache = await caches.open(this._config.cacheName);
    const spaceToFree = this._currentSize + newEntrySize - this._config.maxCacheSize;

    const entries = Array.from(this._metadataIndex?.entries() ?? [])
      .map(([url, metadata]) => ({ url, ...metadata }))
      .sort((a, b) => a.date - b.date);

    let freedSpace = 0;
    for (const entry of entries) {
      if (freedSpace >= spaceToFree) {
        break;
      }

      await cache.delete(entry.url);
      this._metadataIndex?.delete(entry.url);
      this._currentSize -= entry.size;
      freedSpace += entry.size;
    }
  }

  private isExpired(response: Response): boolean {
    const dateHeader = response.headers.get('X-Cache-Date');
    if (!dateHeader) return true;

    const cachedAt = safeParseInt(dateHeader);
    if (cachedAt === 0) return true;

    return Date.now() - cachedAt > this._config.maxAge;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(BYTES_PER_KB));

    return parseFloat((bytes / Math.pow(BYTES_PER_KB, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
