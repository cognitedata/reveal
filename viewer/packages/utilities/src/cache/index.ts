/*!
 * Copyright 2024 Cognite AS
 */

export { CacheManager } from './RevealCacheManager';
export type { CacheConfig, CacheMetrics, CacheEntry, CacheStats, FetchOptions } from './RevealCacheManager';

export {
  getRevealResourceCache,
  getRevealResourceCacheName,
  clearRevealResourceCache,
  getRevealResourceCacheSize
} from './RevealResourceCache';
