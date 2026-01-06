/*!
 * Copyright 2025 Cognite AS
 */

/**
 * Configuration for cache behavior
 */
export type CacheConfig = {
  cacheName: string;
  maxCacheSize: number;
  maxAge: number;
};

/**
 * Information about a cached entry
 */
export type CacheEntry = {
  cacheKey: string;
  size: number;
  cachedAt: Date;
  lastUsed: Date;
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
  entries: CacheEntry[];
};

/**
 * Metadata about a cached entry (stored in-memory for fast access)
 */
export type CacheEntryMetadata = {
  size: number;
  date: number;
  lastUsed: number;
  contentType: string;
};
