/*!
 * Copyright 2024 Cognite AS
 */

export { CacheManager } from './CacheManager';
export type { CacheConfig, CacheMetrics, CacheEntry, CacheStats, FetchOptions } from './CacheManager';

export {
  getRevealResourceCache,
  getRevealResourceCacheName,
  clearRevealResourceCache,
  getRevealResourceCacheSize
} from './RevealResourceCache';
