/*!
 * Copyright 2025 Cognite AS
 */

import { BinaryFileCacheManager } from './BinaryFileCacheManager';
import { CACHE_NAME, DEFAULT_MAX_CACHE_AGE } from './constants';
import { calculateOptimalCacheSize } from './StorageQuotaManager';
import { safeParseInt } from './utils';

/**
 * Cache configuration for all Reveal 3D resources.
 * We use a single shared cache that all resources (point clouds, CAD models, 360 images)
 * can use.
 */

/**
 * Get the resource cache for all Reveal 3D resources
 */

export function getRevealResourceCache(): BinaryFileCacheManager {
  const recommendationSize = calculateOptimalCacheSize();

  return new BinaryFileCacheManager({
    cacheName: CACHE_NAME,
    maxCacheSize: recommendationSize,
    maxAge: DEFAULT_MAX_CACHE_AGE
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
    const responses = await cache.matchAll();

    let totalSize = 0;
    for (const response of responses) {
      if (response) {
        const sizeHeader = response.headers.get('X-Cache-Size');
        const size = safeParseInt(sizeHeader);
        totalSize += size;
      }
    }

    return totalSize;
  } catch (error) {
    console.warn('[Reveal] Failed to get cache size:', error);
    return 0;
  }
}
