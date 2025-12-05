/*!
 * Copyright 2025 Cognite AS
 */

import { CacheConfig, FetchOptions, CacheStats, CacheEntry } from './types';

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
 *
 * // Fetch with caching
 * const data = await pointCloudCache.fetch('https://example.com/data.bin');
 * ```
 */
export class CacheManager {
  private readonly config: Required<CacheConfig>;

  get cacheConfig(): CacheConfig {
    return this.config;
  }

  constructor(config: CacheConfig = {}) {
    this.config = {
      cacheName: config.cacheName ?? 'reveal-cache-v1',
      maxCacheSize: config.maxCacheSize ?? 5000 * 1024 * 1024,
      maxAge: config.maxAge ?? 7 * 24 * 60 * 60 * 1000,
      cacheKeyGenerator: config.cacheKeyGenerator ?? ((url: string) => url)
    };
  }

  /**
   * Fetch data with caching support
   * Checks cache first, falls back to network on miss
   */
  async fetch(url: string, options: FetchOptions = {}): Promise<Response> {
    const cacheKey = this.config.cacheKeyGenerator(url);

    try {
      if (options.bypassCache) {
        return await this.fetchFromNetwork(url, options);
      }

      const cache = await caches.open(this.config.cacheName);
      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        if (!this.isExpired(cachedResponse)) {
          return cachedResponse.clone();
        } else {
          await cache.delete(cacheKey);
        }
      }

      const response = await this.fetchFromNetwork(url, options);

      this.storeInCache(cacheKey, response.clone()).catch(err => {
        console.warn(`[Cache] Failed to store ${this.getFileName(url)}:`, err);
      });

      return response;
    } catch (error) {
      console.error(`[Cache] Error fetching ${this.getFileName(url)}:`, error);
      throw error;
    }
  }

  /**
   * Fetch binary data as ArrayBuffer with caching
   */
  async fetchBinary(url: string, options: FetchOptions = {}): Promise<ArrayBuffer> {
    const response = await this.fetch(url, options);
    return response.arrayBuffer();
  }

  /**
   * Fetch JSON data with caching
   */
  async fetchJSON<T = any>(url: string, options: FetchOptions = {}): Promise<T> {
    const response = await this.fetch(url, options);
    return response.json();
  }

  /**
   * Fetch image as Blob with caching
   */
  async fetchImage(url: string, options: FetchOptions = {}): Promise<Blob> {
    const response = await this.fetch(url, options);
    return response.blob();
  }

  /**
   * Fetch text data with caching
   */
  async fetchText(url: string, options: FetchOptions = {}): Promise<string> {
    const response = await this.fetch(url, options);
    return response.text();
  }

  /**
   * Preload multiple resources into cache
   */
  async preload(urls: string[], concurrency: number = 5): Promise<void> {
    const chunks = this.chunkArray(urls, concurrency);

    for (const chunk of chunks) {
      await Promise.allSettled(
        chunk.map(url =>
          this.fetch(url).catch(err => {
            console.warn(`[Preload] Failed to load ${this.getFileName(url)}:`, err);
          })
        )
      );
    }
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
   * Delete a specific cached entry
   */
  async delete(url: string): Promise<boolean> {
    const cacheKey = this.config.cacheKeyGenerator(url);
    const cache = await caches.open(this.config.cacheName);
    const deleted = await cache.delete(cacheKey);

    return deleted;
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
   * Delete all expired entries
   */
  async deleteExpired(): Promise<number> {
    const cache = await caches.open(this.config.cacheName);
    const requests = await cache.keys();

    let deletedCount = 0;

    for (const request of requests) {
      const response = await cache.match(request);
      if (response && this.isExpired(response)) {
        await cache.delete(request);
        deletedCount++;
      }
    }

    return deletedCount;
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

  private async fetchFromNetwork(url: string, options: FetchOptions): Promise<Response> {
    const fetchOptions: RequestInit = {
      signal: options.signal,
      headers: options.headers
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  private async storeInCache(cacheKey: string, response: Response): Promise<void> {
    try {
      const contentLength = parseInt(response.headers.get('Content-Length') || '0');
      const blob = await response.blob();
      const actualSize = blob.size || contentLength;

      await this.evictIfNeeded(actualSize);

      const cache = await caches.open(this.config.cacheName);

      const headers = new Headers(response.headers);
      headers.set('X-Cache-Date', Date.now().toString());
      headers.set('X-Cache-Size', actualSize.toString());

      const cachedResponse = new Response(blob, {
        status: response.status,
        statusText: response.statusText,
        headers
      });

      await cache.put(cacheKey, cachedResponse);
    } catch (error) {
      throw new Error(`Failed to store in cache: ${error}`);
    }
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

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private getFileName(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.split('/').pop() || url;
    } catch {
      return url;
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
