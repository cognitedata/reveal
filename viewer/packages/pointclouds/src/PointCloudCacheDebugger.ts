/*!
 * Copyright 2025 Cognite AS
 */

import { CacheManager, CacheStats } from '@reveal/utilities';

/**
 * Debug utilities for inspecting point cloud cache in browser console
 *
 * Usage in browser console:
 * ```javascript
 * import { PointCloudCacheDebugger } from '@reveal/pointclouds';
 *
 * const debugger = new PointCloudCacheDebugger();
 * await debugger.printStats();
 * await debugger.listCachedFiles();
 * ```
 */
export class PointCloudCacheDebugger {
  private readonly cache: CacheManager;

  constructor() {
    this.cache = new CacheManager({
      cacheName: 'reveal-pointcloud-v1'
    });
  }

  /**
   * Print detailed cache statistics
   */
  async printStats(): Promise<void> {
    await this.cache.printStats();
  }

  /**
   * Get cache statistics as object
   */
  async getStats(): Promise<CacheStats> {
    return this.cache.getStats();
  }

  /**
   * List all cached point cloud files
   */
  async listCachedFiles(): Promise<void> {
    const stats = await this.cache.getStats();

    console.log('=== Cached Point Cloud Files ===');
    console.log(`Total: ${stats.count} files (${stats.sizeFormatted})`);
    console.log('');

    stats.entries.forEach((entry, index) => {
      const filename = entry.url.split('/').pop();
      const age = this.formatAge(entry.cachedAt);
      console.log(`${index + 1}. ${filename}`);
      console.log(`   Size: ${this.formatBytes(entry.size)}`);
      console.log(`   Cached: ${entry.cachedAt.toLocaleString()} (${age} ago)`);
      console.log(`   Expires: ${entry.expiresAt.toLocaleString()}`);
      console.log('');
    });
  }

  /**
   * Check if a specific file is cached
   */
  async isCached(url: string): Promise<boolean> {
    return this.cache.has(url);
  }

  /**
   * Get cache hit rate and performance metrics
   */
  getMetrics(): ReturnType<CacheManager['getMetrics']> {
    return this.cache.getMetrics();
  }

  /**
   * Clear all cached point cloud data
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
    console.log('Point cloud cache cleared');
  }

  /**
   * Delete expired cache entries
   */
  async cleanupExpired(): Promise<void> {
    const deleted = await this.cache.deleteExpired();
    console.log(`Deleted ${deleted} expired entries`);
  }

  /**
   * Check browser storage quota
   */
  async checkStorageQuota(): Promise<void> {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usedMB = (estimate.usage || 0) / 1024 / 1024;
      const quotaMB = (estimate.quota || 0) / 1024 / 1024;
      const percent = ((estimate.usage || 0) / (estimate.quota || 1)) * 100;

      console.log('=== Browser Storage Quota ===');
      console.log(`Used: ${usedMB.toFixed(2)} MB`);
      console.log(`Total: ${quotaMB.toFixed(2)} MB`);
      console.log(`Usage: ${percent.toFixed(2)}%`);
    } else {
      console.warn('Storage Manager API not available');
    }
  }

  /**
   * Inspect raw Cache API storage
   */
  async inspectRawCache(): Promise<void> {
    const cache = await caches.open('reveal-pointcloud-v1');
    const requests = await cache.keys();

    console.log('=== Raw Cache API Inspection ===');
    console.log(`Cache Name: reveal-pointcloud-v1`);
    console.log(`Total Requests: ${requests.length}`);
    console.log('');

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        console.log(`URL: ${request.url}`);
        console.log(`  Status: ${response.status}`);
        console.log(`  Type: ${response.type}`);
        console.log(`  Headers:`, Object.fromEntries(response.headers.entries()));
        console.log('');
      }
    }
  }

  /**
   * Monitor cache performance over time
   */
  startMonitoring(intervalSeconds: number = 30): NodeJS.Timeout {
    console.log(`Starting cache monitoring (every ${intervalSeconds}s)...`);

    return setInterval(async () => {
      const stats = await this.cache.getStats();
      const metrics = this.cache.getMetrics();

      console.log('[Cache Monitor]', {
        time: new Date().toLocaleTimeString(),
        entries: stats.count,
        size: stats.sizeFormatted,
        hitRate: `${metrics.hitRate.toFixed(1)}%`,
        avgHitTime: `${metrics.avgHitTime.toFixed(1)}ms`,
        avgMissTime: `${metrics.avgMissTime.toFixed(1)}ms`
      });
    }, intervalSeconds * 1000);
  }

  stopMonitoring(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    console.log('Cache monitoring stopped');
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private formatAge(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  }
}

/**
 * Global debug helper - can be accessed from browser console
 *
 * Usage:
 * ```javascript
 * // In browser console
 * window.revealCacheDebug.printStats();
 * window.revealCacheDebug.listCachedFiles();
 * ```
 */
if (typeof window !== 'undefined') {
  (window as any).revealCacheDebug = new PointCloudCacheDebugger();
}
