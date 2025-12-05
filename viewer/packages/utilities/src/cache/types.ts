/*!
 * Copyright 2025 Cognite AS
 */

/**
 * Configuration for cache behavior
 */
export interface CacheConfig {
  /**
   * Name of the cache storage.
   * @default 'reveal-cache-v1'
   */
  cacheName?: string;

  /**
   * Maximum cache size in bytes before eviction starts
   * @default 5000MB (5000 * 1024 * 1024)
   */
  maxCacheSize?: number;

  /**
   * Maximum age of cached items in milliseconds
   * @default 7 days (7 * 24 * 60 * 60 * 1000)
   */
  maxAge?: number;

  /**
   * Enable detailed metrics tracking
   * @default false
   */
  enableMetrics?: boolean;

  /**
   * Enable console logging for cache operations
   * @default false
   */
  enableLogging?: boolean;

  /**
   * Custom cache key generator function
   * @default Uses full URL as key
   */
  cacheKeyGenerator?: (url: string) => string;
}

/**
 * Information about a cached entry
 */
export interface CacheEntry {
  url: string;
  size: number;
  cachedAt: Date;
  contentType: string;
  expiresAt: Date;
}

/**
 * Statistics about the cache state
 */
export interface CacheStats {
  cacheName: string;
  count: number;
  size: number;
  sizeFormatted: string;
  entries: CacheEntry[];
}

/**
 * Options for fetching data
 */
export interface FetchOptions {
  /**
   * AbortSignal to cancel the fetch operation
   */
  signal?: AbortSignal;

  /**
   * Force bypass cache and fetch from network
   */
  bypassCache?: boolean;

  /**
   * Custom headers to include in the request
   */
  headers?: Record<string, string>;
}
