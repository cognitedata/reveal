/*!
 * Copyright 2024 Cognite AS
 */

export { CacheManager } from './CacheManager';
export type {
  CacheConfig,
  CacheMetrics,
  CacheEntry,
  CacheStats,
  FetchOptions
} from './CacheManager';

export {
  createPointCloudCache,
  createCadModelCache,
  createImage360Cache,
  createMetadataCache,
  createTextureCache,
  getAllRevealCacheNames,
  clearAllRevealCaches,
  getTotalRevealCacheSize,
  printAllRevealCacheStats
} from './ResourceCaches';



