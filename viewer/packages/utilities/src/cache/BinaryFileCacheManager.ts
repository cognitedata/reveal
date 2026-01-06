/*!
 * Copyright 2025 Cognite AS
 */

import { CACHE_NAME, DEFAULT_DESKTOP_STORAGE_LIMIT, DEFAULT_MAX_CACHE_AGE, METADATA_CACHE_KEY } from './constants';
import { CacheConfig, CacheStats, CacheEntry, CacheEntryMetadata } from './types';
import { AsyncSequencer } from '../AsyncSequencer';
import { safeParseInt } from './utils';

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

  private _initializePromise: Promise<void> | undefined = undefined;

  private _metadata:
    | {
        index: Map<string, CacheEntryMetadata>;
        currentSize: number;
      }
    | undefined = undefined;

  get cacheConfig(): CacheConfig {
    return this._config;
  }

  constructor(config: Partial<CacheConfig> = {}, cacheStorage: CacheStorage = global.caches) {
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
   *
   * Note: lastUsed updates are consistent (not serialized) to maintain
   * read performance. This should be acceptable because LRU eviction doesn't require
   * perfect accuracy - the race window is very low and worst case is evicting a
   * slightly suboptimal entry.
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
        await this.persistMetadata(cache);
      });
      return undefined;
    }

    const metadata = (await this.getOrInitializeIndex()).index.get(url);
    if (metadata) {
      metadata.lastUsed = Date.now();
      this.updateLastUsedAsync(cache).catch(err =>
        console.warn('[BinaryFileCacheManager] Failed to persist lastUsed:', err)
      );
    }

    return response.clone();
  }

  private async updateLastUsedAsync(cache: Cache): Promise<void> {
    const sequencer = this._asyncSequencer.getNextSequencer<void>();
    await sequencer(async () => {
      await this.persistMetadata(cache);
    });
  }

  /**
   * Get or initialize the in-memory metadata index by scanning the cache
   * Returns the metadata object after ensuring it's initialized
   */
  private async getOrInitializeIndex(): Promise<{ index: Map<string, CacheEntryMetadata>; currentSize: number }> {
    if (this._metadata !== undefined) {
      return this._metadata;
    }

    if (this._initializePromise !== undefined) {
      await this._initializePromise;
      return this._metadata!;
    }

    this._initializePromise = (async () => {
      try {
        const index = new Map<string, CacheEntryMetadata>();
        let currentSize = 0;

        const cache = await this._caches.open(this._config.cacheName);
        const responses = await cache.matchAll();

        const persistedMetadata = await this.loadPersistedMetadata(cache);

        for (const response of responses) {
          if (!response) {
            continue;
          }

          if (response.url === METADATA_CACHE_KEY) {
            continue;
          }

          const size = safeParseInt(response.headers.get('X-Cache-Size'));
          const date = safeParseInt(response.headers.get('X-Cache-Date'));
          const contentType = response.headers.get('Content-Type') ?? 'unknown';

          const lastUsed = persistedMetadata[response.url] ?? date;

          index.set(response.url, { size, date, lastUsed, contentType });
          currentSize += size;
        }

        this._metadata = { index, currentSize };
      } finally {
        this._initializePromise = undefined;
      }
    })();

    await this._initializePromise;
    return this._metadata!;
  }

  private async loadPersistedMetadata(cache: Cache): Promise<Record<string, number>> {
    try {
      const metadataResponse = await cache.match(METADATA_CACHE_KEY);
      if (!metadataResponse) {
        return {};
      }

      const text = await metadataResponse.text();
      return JSON.parse(text);
    } catch (error) {
      console.warn('[BinaryFileCacheManager] Failed to load persisted metadata:', error);
      return {};
    }
  }

  private async persistMetadata(cache: Cache): Promise<void> {
    if (!this._metadata) {
      return;
    }

    try {
      const metadata: Record<string, number> = {};
      for (const [url, entry] of this._metadata.index.entries()) {
        metadata[url] = entry.lastUsed;
      }

      const metadataJson = JSON.stringify(metadata);
      const metadataResponse = new Response(metadataJson, {
        headers: new Headers({
          'Content-Type': 'application/json'
        })
      });

      await cache.put(METADATA_CACHE_KEY, metadataResponse);
    } catch (error) {
      console.warn('[BinaryFileCacheManager] Failed to persist metadata:', error);
    }
  }

  /**
   * Store response in cache
   */
  async storeResponse(url: string, response: Response): Promise<void> {
    const sequencer = this._asyncSequencer.getNextSequencer<void>();
    await sequencer(async () => {
      try {
        const metadata = await this.getOrInitializeIndex();

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

        metadata.index.set(url, { size, date: now, lastUsed: now, contentType });
        metadata.currentSize += size;

        await this.persistMetadata(cache);
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
    return (await this.getOrInitializeIndex()).currentSize;
  }

  /**
   * Get detailed cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const { index } = await this.getOrInitializeIndex();

    const entries: CacheEntry[] = [];
    let totalSize = 0;

    for (const [cacheKey, metadata] of index.entries()) {
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
    const metadata = await this.getOrInitializeIndex();

    if (metadata.currentSize + newEntrySize <= this._config.maxCacheSize) {
      return;
    }

    const cache = await this._caches.open(this._config.cacheName);
    const spaceToFree = metadata.currentSize + newEntrySize - this._config.maxCacheSize;

    const entries = Array.from(metadata.index.entries())
      .map(([url, metadata]) => ({ url, ...metadata }))
      .sort((a, b) => a.lastUsed - b.lastUsed);

    let freedSpace = 0;
    for (const entry of entries) {
      if (freedSpace >= spaceToFree) {
        break;
      }

      await cache.delete(entry.url);
      metadata.index.delete(entry.url);
      metadata.currentSize -= entry.size;
      freedSpace += entry.size;
    }

    if (freedSpace > 0) {
      await this.persistMetadata(cache);
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
