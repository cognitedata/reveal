/*!
 * Copyright 2025 Cognite AS
 */

import { CACHE_NAME, DEFAULT_DESKTOP_STORAGE_LIMIT, DEFAULT_MAX_CACHE_AGE } from './constants';
import { CacheConfig, CacheStats, CacheEntry, CacheEntryMetadata } from './types';
import { AsyncSequencer } from '../AsyncSequencer';

/**
 * Generic Binary File Cache Manager using the Browser Cache API for storing 3D resources
 * Supports caching of binary files (point clouds, CAD models) and images (360 images)
 *
 * @example
 * ```typescript
 * // Create cache for point clouds
 * const pointCloudCache = new BinaryFileCacheManager({
 *   cacheName: 'reveal-pointcloud-v1',
 *   maxCacheSize: 500 * 1024 * 1024, // 500MB
 *   maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
 *   enableMetrics: true
 * });
 * ```
 */
export class BinaryFileCacheManager {
  private readonly DEFAULT_CONFIG: CacheConfig = {
    cacheName: CACHE_NAME,
    maxCacheSize: DEFAULT_DESKTOP_STORAGE_LIMIT,
    maxAge: DEFAULT_MAX_CACHE_AGE
  };

  private readonly _config: CacheConfig = { ...this.DEFAULT_CONFIG };
  private readonly _asyncSequencer = new AsyncSequencer();
  private readonly _caches: CacheStorage;

  private _metadata:
    | {
        index: Map<string, CacheEntryMetadata>;
        currentSize: number;
      }
    | undefined = undefined;

  get cacheConfig(): CacheConfig {
    return this._config;
  }

  constructor(config: Partial<CacheConfig> = {}, cacheStorage: CacheStorage = caches) {
    this._config = { ...this._config, ...config };
    this._caches = cacheStorage;
  }

  /**
   * Check if a URL is cached
   */
  async has(url: string): Promise<boolean> {
    const cache = await this._caches.open(this._config.cacheName);
    const response = await cache.match(url);

    if (!response) return false;

    return !isExpired(response, this._config.maxAge);
  }

  /**
   * Clear all cached entries and reset the in-memory index
   */
  async clear(): Promise<void> {
    const sequencer = this._asyncSequencer.getNextSequencer<void>();
    await sequencer(async () => {
      try {
        await this._caches.delete(this._config.cacheName);
        this._metadata = undefined;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`[BinaryFileCacheManager] Clear operation failed: ${message}`, { cause: error });
      }
    });
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
      const sequencer = this._asyncSequencer.getNextSequencer<void>();
      await sequencer(async () => {
        await cache.delete(url);
        if (this._metadata) {
          const metadata = this._metadata.index.get(url);
          if (metadata) {
            this._metadata.currentSize -= metadata.size;
            this._metadata.index.delete(url);
          }
        }
      });
      return undefined;
    }

    await this.initializeIndex();
    if (this._metadata) {
      const metadata = this._metadata.index.get(url);
      if (metadata) {
        metadata.lastUsed = Date.now();
      }
    }

    return response.clone();
  }

  private _initializePromise: Promise<void> | undefined = undefined;

  /**
   * Initialize the in-memory metadata index by scanning the cache
   */
  private async initializeIndex(): Promise<void> {
    if (this._metadata !== undefined) {
      return;
    }

    if (this._initializePromise !== undefined) {
      return this._initializePromise;
    }

    this._initializePromise = (async () => {
      try {
        const index = new Map<string, CacheEntryMetadata>();
        let currentSize = 0;

        const cache = await this._caches.open(this._config.cacheName);
        const responses = await cache.matchAll();

        for (const response of responses) {
          if (!response) {
            continue;
          }

          const size = safeParseInt(response.headers.get('X-Cache-Size'));
          const date = safeParseInt(response.headers.get('X-Cache-Date'));
          const contentType = response.headers.get('Content-Type') ?? 'unknown';

          index.set(response.url, { size, date, lastUsed: date, contentType });
          currentSize += size;
        }

        this._metadata = { index, currentSize };
      } finally {
        this._initializePromise = undefined;
      }
    })();

    await this._initializePromise;
  }

  /**
   * Store response in cache
   */
  async storeResponse(url: string, response: Response): Promise<void> {
    const sequencer = this._asyncSequencer.getNextSequencer<void>();
    await sequencer(async () => {
      try {
        await this.initializeIndex();

        const contentLength = response.headers.get('Content-Length');
        const size = contentLength ? safeParseInt(contentLength) : (await response.clone().arrayBuffer()).byteLength;

        await this.evictIfNeeded(size);

        const cache = await this._caches.open(this._config.cacheName);

        const now = Date.now();
        const contentType = response.headers.get('Content-Type') ?? 'application/octet-stream';

        const headers = new Headers(response.headers);
        headers.set('X-Cache-Date', now.toString());
        headers.set('X-Cache-Size', size.toString());

        const cachedResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers
        });

        await cache.put(url, cachedResponse);

        if (this._metadata) {
          this._metadata.index.set(url, { size, date: now, lastUsed: now, contentType });
          this._metadata.currentSize += size;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`[BinaryFileCacheManager] Failed to store in cache: ${message}`, { cause: error });
      }
    });
  }

  /**
   * Get current cache size in bytes
   */
  async getSize(): Promise<number> {
    await this.initializeIndex();
    return this._metadata?.currentSize ?? 0;
  }

  /**
   * Get detailed cache statistics
   */
  async getStats(): Promise<CacheStats> {
    await this.initializeIndex();

    const entries: CacheEntry[] = [];
    let totalSize = 0;

    for (const [cacheKey, metadata] of this._metadata?.index.entries() ?? []) {
      const cachedAt = new Date(metadata.date);
      const lastUsed = new Date(metadata.lastUsed);
      const expiresAt = new Date(cachedAt.getTime() + this._config.maxAge);

      totalSize += metadata.size;
      entries.push({
        cacheKey,
        size: metadata.size,
        cachedAt,
        lastUsed,
        expiresAt,
        contentType: metadata.contentType
      });
    }

    return {
      cacheName: this._config.cacheName,
      count: entries.length,
      size: totalSize,
      entries: entries.sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime())
    };
  }

  /**
   * Evict entries if needed to make space for a new entry
   */
  private async evictIfNeeded(newEntrySize: number): Promise<void> {
    await this.initializeIndex();

    if ((this._metadata?.currentSize ?? 0) + newEntrySize <= this._config.maxCacheSize) {
      return;
    }

    const cache = await this._caches.open(this._config.cacheName);
    const spaceToFree = (this._metadata?.currentSize ?? 0) + newEntrySize - this._config.maxCacheSize;

    const entries = Array.from(this._metadata?.index.entries() ?? [])
      .map(([url, metadata]) => ({ url, ...metadata }))
      .sort((a, b) => a.lastUsed - b.lastUsed);

    let freedSpace = 0;
    for (const entry of entries) {
      if (freedSpace >= spaceToFree) {
        break;
      }

      await cache.delete(entry.url);
      this._metadata?.index.delete(entry.url);
      if (this._metadata) {
        this._metadata.currentSize -= entry.size;
      }
      freedSpace += entry.size;
    }
  }
}

function isExpired(response: Response, maxAge: number): boolean {
  const dateHeader = response.headers.get('X-Cache-Date');
  if (!dateHeader) return true;

  const cachedAt = safeParseInt(dateHeader);
  if (cachedAt === 0) return true;

  return Date.now() - cachedAt > maxAge;
}

function safeParseInt(value: string | null | undefined): number {
  const defaultValue = 0;
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
