/*!
 * Copyright 2025 Cognite AS
 */

import { CACHE_NAME, DEFAULT_MAX_CACHE_AGE } from './constants';
import { RevealCacheManager } from './RevealCacheManager';
import { calculateOptimalCacheSize } from './StorageQuotaManager';

/**
 * Cache configuration for all Reveal 3D resources.
 *
 * We use a single shared cache that all resources (point clouds, CAD models, 360 images)
 * can use. This provides:
 *
 * - Better resource utilization (unused quota from one type benefits others)
 * - Simpler management (single cache to monitor and clear)
 * - Consistent behavior across all 3D resources
 * - Automatic cache size optimization based on device and available storage
 */

/**
 * Get the resource cache for all Reveal 3D resources
 *
 * The cache size is automatically determined based on device type and characteristics.
 *
 * @param overrides Optional configuration overrides
 * @returns CacheManager instance for 3D resources
 * */

export function getRevealResourceCache(): RevealCacheManager {
  const recommendationSize = calculateOptimalCacheSize();

  return new RevealCacheManager({
    cacheName: CACHE_NAME,
    maxCacheSize: recommendationSize,
    maxAge: DEFAULT_MAX_CACHE_AGE,
    cacheKeyGenerator: (url: string) => url
  });
}

/**
 * Get the resource cache name
 */
export function getRevealResourceCacheName(): string {
  return CACHE_NAME;
}

/**
 * Clear the resource cache
 */
export async function clearRevealResourceCache(): Promise<void> {
  await caches.delete(CACHE_NAME);
}

/**
 * Get total size of resource cache
 */
export async function getRevealResourceCacheSize(): Promise<number> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();

    let totalSize = 0;
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const sizeHeader = response.headers.get('X-Cache-Size');
        totalSize += sizeHeader ? parseInt(sizeHeader) : 0;
      }
    }

    return totalSize;
  } catch (error) {
    console.warn('[Reveal] Failed to get cache size:', error);
    return 0;
  }
}
