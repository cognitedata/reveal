/*!
 * Copyright 2026 Cognite AS
 */
import { BINARY_FILES_CACHE_HEADER_DATE, BINARY_FILES_CACHE_HEADER_SIZE, BINARY_FILES_CACHE_NAME } from './constants';
import type { CacheConfig } from './types';
import { safeParseInt } from './utils';

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
    maxAge: Infinity,
    maxCacheSize: Infinity
  };

  private readonly _config: CacheConfig = { ...this.DEFAULT_CONFIG };
  private readonly _caches: CacheStorage;
  // In-memory LRU tracker: url → last accessed timestamp (not persisted, used for eviction ordering)
  private readonly _lastAccessed = new Map<string, number>();

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
      this._lastAccessed.delete(url);
      return undefined;
    }

    this._lastAccessed.set(url, Date.now());
    return response.clone();
  }

  /**
   * Store data in cache. On quota exceeded, evicts LRU entries and retries once.
   */
  async storeResponse(url: string, data: ArrayBuffer, contentType: string = 'application/octet-stream'): Promise<void> {
    try {
      await this.putInCache(url, data, contentType);
    } catch (error) {
      if (isQuotaError(error)) {
        await this.evictLeastRecentlyUsedEntries();
        try {
          await this.putInCache(url, data, contentType);
        } catch (retryError) {
          const message = retryError instanceof Error ? retryError.message : String(retryError);
          console.warn(`[DataFileCacheManager] Failed to store in cache after LRU eviction: ${message}`);
        }
      } else {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(`[DataFileCacheManager] Failed to store in cache: ${message}`);
      }
    }
  }

  private async putInCache(url: string, data: ArrayBuffer, contentType: string): Promise<void> {
    const cache = await this._caches.open(this._config.cacheName);
    const now = Date.now();
    const size = data.byteLength;

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

    this._lastAccessed.set(url, now);
  }

  private async evictLeastRecentlyUsedEntries(): Promise<void> {
    const cache = await this._caches.open(this._config.cacheName);
    const keys = await cache.keys();
    if (keys.length === 0) return;

    const evictCount = Math.max(1, Math.floor(keys.length * 0.2));
    const notInMemory: string[] = [];
    const inMemory: Array<{ url: string; lastAccessed: number }> = [];

    for (const request of keys) {
      const lastAccessed = this._lastAccessed.get(request.url);
      if (lastAccessed !== undefined) {
        inMemory.push({ url: request.url, lastAccessed });
      } else {
        // Not seen this session — treat as older than anything in _lastAccessed
        notInMemory.push(request.url);
      }
    }

    let toEvict: string[];
    if (notInMemory.length >= evictCount) {
      toEvict = notInMemory.slice(0, evictCount);
    } else {
      inMemory.sort((a, b) => a.lastAccessed - b.lastAccessed);
      toEvict = [...notInMemory, ...inMemory.map(e => e.url)].slice(0, evictCount);
    }

    await Promise.all(toEvict.map(url => cache.delete(url)));
    toEvict.forEach(url => this._lastAccessed.delete(url));
  }
}

function isExpired(response: Response, maxAge: number): boolean {
  const cachedAt = safeParseInt(response.headers.get(BINARY_FILES_CACHE_HEADER_DATE));
  if (cachedAt === undefined) return true;
  return Date.now() - cachedAt > maxAge;
}

function isQuotaError(error: unknown): boolean {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') return true;
  const message = error instanceof Error ? error.message : String(error);
  // Firefox: NS_ERROR_FILE_NO_DEVICE_SPACE
  // Safari iOS (pre-spec): "The quota has been exceeded."
  // Older WebKit/Blink: message may contain 'QuotaExceededError'
  return (
    message.includes('QuotaExceededError') ||
    message.includes('No device space') ||
    message.includes('quota has been exceeded')
  );
}
