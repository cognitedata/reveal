/*!
 * Copyright 2026 Cognite AS
 */
import { CACHE_HEADER_DATE, CACHE_HEADER_SIZE, CACHE_NAME } from './constants';
import { CacheConfig } from './types';
import { safeParseInt } from './utils';

/**
 * Generic Binary File Cache Manager using the Browser Cache API for storing 3D resources
 * Supports caching of binary files (point clouds, CAD models) and images (360 images)
 *
 * @example
 * ```typescript
 * // Default: Cache forever, browser manages eviction
 * const cache = new BinaryFileCacheManager({
 *   cacheName: 'reveal-3d-resources-v1'
 * });
 *
 * // Optional: Add time-based expiration
 * const cache = new BinaryFileCacheManager({
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
export class BinaryFileCacheManager {
  private readonly DEFAULT_CONFIG: CacheConfig = {
    cacheName: CACHE_NAME,
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
      throw new Error(`[BinaryFileCacheManager] Clear operation failed: ${message}`, { cause: error });
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
   * Store response in cache
   * Browser will automatically evict old entries when quota is reached
   */
  async storeResponse(url: string, response: Response): Promise<void> {
    try {
      const cache = await this._caches.open(this._config.cacheName);

      const responseToCache = response.clone();
      const bodyData = await responseToCache.arrayBuffer();
      const size = bodyData.byteLength;

      const now = Date.now();

      const headers = new Headers(response.headers);
      headers.set(CACHE_HEADER_DATE, now.toString());
      headers.set(CACHE_HEADER_SIZE, size.toString());

      const cachedResponse = new Response(bodyData, {
        status: response.status,
        statusText: response.statusText,
        headers
      });

      await cache.put(url, cachedResponse);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`[BinaryFileCacheManager] Failed to store in cache: ${message}`, { cause: error });
    }
  }
}

function isExpired(response: Response, maxAge: number): boolean {
  const cachedAt = safeParseInt(response.headers.get(CACHE_HEADER_DATE));
  if (cachedAt === 0) return true;
  return Date.now() - cachedAt > maxAge;
}
