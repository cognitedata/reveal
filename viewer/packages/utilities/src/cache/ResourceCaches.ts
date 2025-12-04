/*!
 * Copyright 2025 Cognite AS
 */

import { CacheConfig, CacheManager } from "./CacheManager";

/**
 * Pre-configured cache managers for different 3D resource types.
 * Each resource type has its own cache storage with appropriate size limits and expiration.
 */

/**
 * Cache configuration for point cloud data (.bin files)
 * - Large cache size (500MB) for point cloud tiles
 * - 7 day expiration
 */
export function createPointCloudCache(overrides?: Partial<CacheConfig>): CacheManager {
  return new CacheManager({
    cacheName: 'reveal-pointcloud-v1',
    maxCacheSize: 500 * 1024 * 1024,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    enableMetrics: true,
    enableLogging: false,
    ...overrides
  });
}

/**
 * Cache configuration for CAD model data
 * - Large cache size (1GB) for CAD geometry
 * - 14 day expiration (CAD models change less frequently)
 */
export function createCadModelCache(overrides?: Partial<CacheConfig>): CacheManager {
  return new CacheManager({
    cacheName: 'reveal-cad-v1',
    maxCacheSize: 1024 * 1024 * 1024,
    maxAge: 14 * 24 * 60 * 60 * 1000,
    enableMetrics: true,
    enableLogging: false,
    ...overrides
  });
}

/**
 * Cache configuration for 360 images
 * - Medium cache size (300MB) for image tiles
 * - 7 day expiration
 */
export function createImage360Cache(overrides?: Partial<CacheConfig>): CacheManager {
  return new CacheManager({
    cacheName: 'reveal-image360-v1',
    maxCacheSize: 300 * 1024 * 1024,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    enableMetrics: true,
    enableLogging: false,
    ...overrides
  });
}

/**
 * Cache configuration for model metadata (JSON files)
 * - Small cache size (50MB) for metadata
 * - 1 day expiration (metadata may change more frequently)
 */
export function createMetadataCache(overrides?: Partial<CacheConfig>): CacheManager {
  return new CacheManager({
    cacheName: 'reveal-metadata-v1',
    maxCacheSize: 50 * 1024 * 1024,
    maxAge: 1 * 24 * 60 * 60 * 1000,
    enableMetrics: true,
    enableLogging: false,
    ...overrides
  });
}

/**
 * Cache configuration for texture data
 * - Medium cache size (250MB) for textures
 * - 7 day expiration
 */
export function createTextureCache(overrides?: Partial<CacheConfig>): CacheManager {
  return new CacheManager({
    cacheName: 'reveal-texture-v1',
    maxCacheSize: 250 * 1024 * 1024,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    enableMetrics: true,
    enableLogging: false,
    ...overrides
  });
}

/**
 * Get all Reveal cache names for management operations
 */
export function getAllRevealCacheNames(): string[] {
  return ['reveal-pointcloud-v1', 'reveal-cad-v1', 'reveal-image360-v1', 'reveal-metadata-v1', 'reveal-texture-v1'];
}

/**
 * Clear all Reveal caches
 */
export async function clearAllRevealCaches(): Promise<void> {
  const cacheNames = getAllRevealCacheNames();
  await Promise.all(cacheNames.map(name => caches.delete(name)));
  console.log('[Reveal] All caches cleared');
}

/**
 * Get total size across all Reveal caches
 */
export async function getTotalRevealCacheSize(): Promise<number> {
  const cacheNames = getAllRevealCacheNames();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const sizeHeader = response.headers.get('X-Cache-Size');
          totalSize += sizeHeader ? parseInt(sizeHeader) : 0;
        }
      }
    } catch (error) {
      console.warn(`[Reveal] Failed to get size for cache ${cacheName}:`, error);
    }
  }

  return totalSize;
}

/**
 * Print statistics for all Reveal caches
 */
export async function printAllRevealCacheStats(): Promise<void> {
  console.log('=== Reveal Cache Statistics ===\n');

  const managers = [
    { name: 'Point Cloud', manager: createPointCloudCache() },
    { name: 'CAD Model', manager: createCadModelCache() },
    { name: '360 Images', manager: createImage360Cache() },
    { name: 'Metadata', manager: createMetadataCache() },
    { name: 'Textures', manager: createTextureCache() }
  ];

  for (const { name, manager } of managers) {
    const stats = await manager.getStats();
    console.log(`${name}:`);
    console.log(`  Entries: ${stats.count}`);
    console.log(`  Size: ${stats.sizeFormatted}`);
    console.log(`  Hit Rate: ${stats.hitRate.toFixed(2)}%`);
    console.log(`  Avg Hit Time: ${stats.avgHitTime.toFixed(2)}ms`);
    console.log(`  Avg Miss Time: ${stats.avgMissTime.toFixed(2)}ms`);
    console.log('');
  }

  const totalSize = await getTotalRevealCacheSize();
  console.log(`Total Cache Size: ${formatBytes(totalSize)}`);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
