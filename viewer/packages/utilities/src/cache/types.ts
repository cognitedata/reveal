/*!
 * Copyright 2025 Cognite AS
 */

/**
 * Configuration for cache behavior
 */
export type CacheConfig = {
  cacheName?: string;
  maxCacheSize?: number;
  maxAge?: number;
  cacheKeyGenerator?: (url: string) => string;
};

/**
 * Information about a cached entry
 */
export type CacheEntry = {
  cacheKey: string;
  size: number;
  cachedAt: Date;
  contentType: string;
  expiresAt: Date;
};

/**
 * Statistics about the cache state
 */
export type CacheStats = {
  cacheName: string;
  count: number;
  size: number;
  sizeFormatted: string;
  entries: CacheEntry[];
};
