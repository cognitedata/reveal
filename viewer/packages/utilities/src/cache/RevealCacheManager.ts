/*!
 * Copyright 2025 Cognite AS
 */

import { BYTES_PER_KB, CACHE_NAME, DEFAULT_DESKTOP_STORAGE_LIMIT, DEFAULT_MAX_CACHE_AGE } from './constants';
import { CacheConfig, CacheStats, CacheEntry } from './types';

/**
 * Generic Cache Manager using the Cache API for storing 3D resources
 *
 * Supports caching of binary files (point clouds, CAD models) and images (360 images)
 * with automatic eviction, expiration, and performance metrics.
 *
 * @example
 * ```typescript
 * // Create cache for point clouds
 * const pointCloudCache = new CacheManager({
 *   cacheName: 'reveal-pointcloud-v1',
 *   maxCacheSize: 500 * 1024 * 1024, // 500MB
 *   maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
 *   enableMetrics: true
 * });
 * ```
 */
export class RevealCacheManager {
  private readonly config: Required<CacheConfig>;

  get cacheConfig(): CacheConfig {
    return this.config;
  }

  constructor(config: CacheConfig = {}) {
    this.config = {
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
    const cacheKey = this.config.cacheKeyGenerator(url);
    const cache = await caches.open(this.config.cacheName);
    const response = await cache.match(cacheKey);

    if (!response) return false;

    return !this.isExpired(response);
  }

  /**
   * Clear all cached entries
   */
  async clear(): Promise<void> {
    await caches.delete(this.config.cacheName);
  }

  /**
   * Get a cached response if it exists and is not expired
   * Used by CachedModelDataProvider to check cache before using authenticated fetch
   */
  async getCachedResponse(url: string): Promise<Response | null> {
    const cacheKey = this.config.cacheKeyGenerator(url);
    const cache = await caches.open(this.config.cacheName);
    const response = await cache.match(cacheKey);

    if (!response) {
      return null;
    }

    if (this.isExpired(response)) {
      await cache.delete(cacheKey);
      return null;
    }

    return response.clone();
  }

  /**
   * Store data in cache
   * Used by CachedModelDataProvider to cache responses from authenticated requests
   */
  async storeResponse(url: string, data: ArrayBuffer | string, contentType: string): Promise<void> {
    try {
      const cacheKey = this.config.cacheKeyGenerator(url);

      const blob =
        typeof data === 'string' ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
      const size = blob.size;

      await this.evictIfNeeded(size);

      const cache = await caches.open(this.config.cacheName);

      const headers = new Headers({
        'Content-Type': contentType,
        'X-Cache-Date': Date.now().toString(),
        'X-Cache-Size': size.toString()
      });

      const response = new Response(blob, {
        status: 200,
        statusText: 'OK',
        headers
      });

      await cache.put(cacheKey, response);
    } catch (error) {
      throw new Error(`Failed to store in cache: ${error}`);
    }
  }

  /**
   * Get current cache size in bytes
   */
  async getSize(): Promise<number> {
    const cache = await caches.open(this.config.cacheName);
    const requests = await cache.keys();

    let totalSize = 0;
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const sizeHeader = response.headers.get('X-Cache-Size');
        totalSize += sizeHeader ? parseInt(sizeHeader) : 0;
      }
    }

    return totalSize;
  }

  /**
   * Get detailed cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const cache = await caches.open(this.config.cacheName);
    const requests = await cache.keys();

    const entries: CacheEntry[] = [];
    let totalSize = 0;

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const sizeHeader = response.headers.get('X-Cache-Size');
        const dateHeader = response.headers.get('X-Cache-Date');
        const size = sizeHeader ? parseInt(sizeHeader) : 0;
        const cachedAt = dateHeader ? new Date(parseInt(dateHeader)) : new Date();
        const expiresAt = new Date(cachedAt.getTime() + this.config.maxAge);
        const contentType = response.headers.get('Content-Type') || 'unknown';

        totalSize += size;
        entries.push({
          url: request.url,
          size,
          cachedAt,
          expiresAt,
          contentType
        });
      }
    }

    return {
      cacheName: this.config.cacheName,
      count: entries.length,
      size: totalSize,
      sizeFormatted: this.formatBytes(totalSize),
      entries: entries.sort((a, b) => b.cachedAt.getTime() - a.cachedAt.getTime())
    };
  }

  private async evictIfNeeded(newEntrySize: number): Promise<void> {
    const currentSize = await this.getSize();

    if (currentSize + newEntrySize <= this.config.maxCacheSize) {
      return;
    }
    await this.evictOldestEntries(newEntrySize);
  }

  private async evictOldestEntries(spaceNeeded: number): Promise<void> {
    const cache = await caches.open(this.config.cacheName);
    const requests = await cache.keys();

    const entries: Array<{ request: Request; date: number; size: number }> = [];

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('X-Cache-Date');
        const sizeHeader = response.headers.get('X-Cache-Size');

        entries.push({
          request,
          date: dateHeader ? parseInt(dateHeader) : 0,
          size: sizeHeader ? parseInt(sizeHeader) : 0
        });
      }
    }

    entries.sort((a, b) => a.date - b.date);

    let freedSpace = 0;
    let evictedCount = 0;

    for (const entry of entries) {
      if (freedSpace >= spaceNeeded) {
        break;
      }

      await cache.delete(entry.request);
      freedSpace += entry.size;
      evictedCount++;
    }
  }

  private isExpired(response: Response): boolean {
    const dateHeader = response.headers.get('X-Cache-Date');
    if (!dateHeader) return true;

    const cachedAt = parseInt(dateHeader);
    return Date.now() - cachedAt > this.config.maxAge;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(BYTES_PER_KB));

    return parseFloat((bytes / Math.pow(BYTES_PER_KB, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
