/*!
 * Copyright 2026 Cognite AS
 */
import { BINARY_FILES_CACHE_HEADER_DATE, BINARY_FILES_CACHE_HEADER_SIZE, BINARY_FILES_CACHE_NAME } from './constants';
import { CacheConfig } from './types';
import { getCacheDate, getCacheSize, safeParseInt } from './utils';

/**
 * Data File Cache Manager using the Browser Cache API for storing various data files
 * Supports caching of binary files (point clouds, CAD models), images (360 images), and JSON data
 *
 * @example
 * ```typescript
 * // Default: Cache forever, browser manages eviction
 * const cache = new DataFileCacheManager({
 *   cacheName: 'reveal-3d-resources-v1'
 * });
 *
 * // Optional: Add time-based expiration
 * const cache = new DataFileCacheManager({
 *   cacheName: 'reveal-3d-resources-v1',
 *   maxAge: 7 * 24 * 60 * 60 * 1000 // Expire after 7 days
 * });
 *
 * // Store a response
 * await cache.storeResponse(url, response);
 *
 * // Retrieve cached response, returns undefined if expired or not found
 * const cachedResponse = await cache.getCachedResponse(url);
 * ```
 */
export class DataFileCacheManager {
  private readonly DEFAULT_CONFIG: CacheConfig = {
    cacheName: BINARY_FILES_CACHE_NAME,
    maxAge: Infinity, // Cache forever until browser evicts
    maxCacheSize: Infinity // No limit - browser manages storage quota
  };

  private readonly _config: CacheConfig = { ...this.DEFAULT_CONFIG };
  private readonly _caches: CacheStorage;

  get cacheConfig(): CacheConfig {
    return this._config;
  }

  constructor(config: Partial<CacheConfig> = {}, cacheStorage: CacheStorage = global.caches) {
    this._config = { ...this.DEFAULT_CONFIG, ...config };
    this._caches = cacheStorage;
  }

  /**
   * Check if a URL is cached and not expired
   */
  async has(url: string): Promise<boolean> {
    const cache = await this._caches.open(this._config.cacheName);
    const response = await cache.match(url);

    if (!response) return false;

    if (isExpired(response, this._config.maxAge)) {
      await cache.delete(url);
      return false;
    }
    return true;
  }

  /**
   * Clear all cached entries
   */
  async clear(): Promise<void> {
    try {
      await this._caches.delete(this._config.cacheName);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`[DataFileCacheManager] Clear operation failed: ${message}`, { cause: error });
    }
  }

  /**
   * Get a cached response if it exists and is not expired
   */
  async getCachedResponse(url: string): Promise<Response | undefined> {
    const cache = await this._caches.open(this._config.cacheName);
    const response = await cache.match(url);

    if (!response) {
      return undefined;
    }

    if (isExpired(response, this._config.maxAge)) {
      await cache.delete(url);
      return undefined;
    }

    return response.clone();
  }

  /**
   * Store data in cache
   * Browser will automatically evict old entries when quota is reached
   */
  async storeResponse(url: string, data: ArrayBuffer, contentType: string = 'application/octet-stream'): Promise<void> {
    try {
      const cache = await this._caches.open(this._config.cacheName);

      const size = data.byteLength;
      const now = Date.now();

      const headers = new Headers({
        'Content-Type': contentType,
        'Content-Length': size.toString(),
        [BINARY_FILES_CACHE_HEADER_DATE]: now.toString(),
        [BINARY_FILES_CACHE_HEADER_SIZE]: size.toString()
      });

      const cachedResponse = new Response(data, {
        status: 200,
        statusText: 'OK',
        headers
      });

      await cache.put(url, cachedResponse);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`[DataFileCacheManager] Failed to store in cache: ${message}`, { cause: error });
    }
  }

  /**
   * Remove all expired entries from the cache, then evict oldest entries if over size limit
   * Call periodically or on app startup to prevent stale data buildup
   * Note: Default cacheConfig is set to never expire and no size limit, so pruning is opt-in by setting maxAge or maxCacheSize
   * @returns Number of entries removed
   */
  async pruneCache(): Promise<number> {
    const cache = await this._caches.open(this._config.cacheName);

    let removed = 0;
    if (this.cacheConfig.maxAge !== Infinity) {
      removed += await this.pruneCacheByExpiration(cache, this.cacheConfig.maxAge);
    }

    if (this._config.maxCacheSize !== Infinity) {
      removed += await this.pruneCacheBySize(cache, this._config.maxCacheSize);
    }

    return removed;
  }

  /**
   * Remove entries that have exceeded maxAge
   * @param cache Cache instance to prune
   * @param maxAgeMs Maximum age in milliseconds before an entry is considered expired
   * @returns Number of entries removed
   */
  private async pruneCacheByExpiration(cache: Cache, maxAgeMs: number): Promise<number> {
    const keys = await cache.keys();
    let removed = 0;

    for (const request of keys) {
      const response = await cache.match(request);
      if (response && isExpired(response, maxAgeMs)) {
        await cache.delete(request);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Remove oldest entries until cache size is under maxCacheSize
   * Uses LRU-style eviction based on cache date
   * @param cache Cache instance to prune
   * @param maxSizeBytes Maximum allowed cache size in bytes
   * @returns Number of entries removed
   */
  private async pruneCacheBySize(cache: Cache, maxSizeBytes: number): Promise<number> {
    if (maxSizeBytes === Infinity) {
      return 0; // No size limit, no pruning needed
    }
    const keys = await cache.keys();
    const entries: Array<{ request: Request; date: number; size: number }> = [];
    let totalSize = 0;

    // Collect entry metadata
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const date = getCacheDate(response) ?? 0;
        const size = getCacheSize(response) ?? 0;
        entries.push({ request, date, size });
        totalSize += size;
      }
    }

    // If under limit, nothing to prune
    if (totalSize <= maxSizeBytes) {
      return 0;
    }

    // Sort by date ascending (oldest first)
    entries.sort((a, b) => a.date - b.date);

    let removed = 0;
    // Remove oldest entries until under the limit
    for (const entry of entries) {
      if (totalSize <= maxSizeBytes) {
        break;
      }
      await cache.delete(entry.request);
      totalSize -= entry.size;
      removed++;
    }

    return removed;
  }
}

function isExpired(response: Response, maxAge: number): boolean {
  const cachedAt = safeParseInt(response.headers.get(BINARY_FILES_CACHE_HEADER_DATE));
  if (cachedAt === undefined) return true;
  return Date.now() - cachedAt > maxAge;
}
