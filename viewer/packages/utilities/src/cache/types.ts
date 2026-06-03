/*!
 * Copyright 2025 Cognite AS
 */

/**
 * Configuration for cache behavior
 */
export type CacheConfig = {
  /** Name of the cache */
  cacheName: string;
  /** Maximum age in milliseconds before entries expire (Default is Infinity = never expire) */
  maxAge: number;
  /** Maximum cache size in bytes (Default is Infinity = browser manages quota) */
  maxCacheSize: number;
};
