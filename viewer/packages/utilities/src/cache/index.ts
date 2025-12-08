/*!
 * Copyright 2024 Cognite AS
 */

export { RevealCacheManager } from './RevealCacheManager';
export type { CacheConfig, CacheEntry, CacheStats, FetchOptions } from './types';

export {
  getRevealResourceCache,
  getRevealResourceCacheName,
  clearRevealResourceCache,
  getRevealResourceCacheSize
} from './RevealResourceCache';
