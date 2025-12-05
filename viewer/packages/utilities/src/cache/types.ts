/*!
 * Copyright 2025 Cognite AS
 */

/**
 * Configuration for cache behavior
 */
export interface CacheConfig {
  /**
   * Name of the cache storage.
   */
  cacheName?: string;

  /**
   * Maximum cache size in bytes before eviction starts
   */
  maxCacheSize?: number;

  /**
   * Maximum age of cached items in milliseconds
   */
  maxAge?: number;

  /**
   * Custom cache key generator function
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
