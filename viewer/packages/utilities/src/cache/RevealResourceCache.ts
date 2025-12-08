/*!
 * Copyright 2025 Cognite AS
 */

import { RevealCacheManager } from './RevealCacheManager';
import { CacheConfig } from './types';

/**
 * Cache configuration for all Reveal 3D resources.
 *
 * We use a single shared cache that all resources (point clouds, CAD models, 360 images)
 * can use. This provides:
 *
 * - Better resource utilization (unused quota from one type benefits others)
 * - Simpler management (single cache to monitor and clear)
 * - Consistent behavior across all 3D resources
 */

/**
 * Get the resource cache for all Reveal 3D resources
 *
 * @param overrides Optional configuration overrides
 * @returns CacheManager instance for 3D resources
 *
 * @example
 * ```typescript
 * const cache = getRevealResourceCache();
 * const data = await cache.fetchBinary('https://example.com/tile.bin');
 * ```
 */
export function getRevealResourceCache(overrides?: Partial<CacheConfig>): RevealCacheManager {
  return new RevealCacheManager({
    cacheName: 'reveal-3d-resources-v1',
    maxCacheSize: 2048 * 1024 * 1024,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...overrides
  });
}

/**
 * Get the resource cache name
 */
export function getRevealResourceCacheName(): string {
  return 'reveal-3d-resources-v1';
}

/**
 * Clear the resource cache
 */
export async function clearRevealResourceCache(): Promise<void> {
  await caches.delete('reveal-3d-resources-v1');
}

/**
 * Get total size of resource cache
 */
export async function getRevealResourceCacheSize(): Promise<number> {
  try {
    const cache = await caches.open('reveal-3d-resources-v1');
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
