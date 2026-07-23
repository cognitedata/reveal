/*!
 * Copyright 2025 Cognite AS
 */

import type { ModelDataProvider } from '../ModelDataProvider';
import type { ModelIdentifier } from '../ModelIdentifier';
import type { SignedFileItem } from '../types';
import type { CacheConfig } from '@reveal/utilities';
import { DataFileCacheManager } from '@reveal/utilities';

/**
 * Wraps a ModelDataProvider with caching capabilities using the Cache API.
 *
 * This provider intercepts getBinaryFile and getJsonFile calls and caches
 * the responses for faster subsequent access.
 */
export class CachedModelDataProvider implements ModelDataProvider {
  private readonly baseProvider: ModelDataProvider;
  private readonly cacheManager: DataFileCacheManager;

  constructor(baseProvider: ModelDataProvider, cacheConfig?: CacheConfig, cacheStorage?: CacheStorage) {
    this.baseProvider = baseProvider;
    this.cacheManager = new DataFileCacheManager(cacheConfig, cacheStorage);
  }

  async getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer> {
    const key = this.resolveCacheKey(baseUrl, fileName);
    if (!key) {
      return this.baseProvider.getBinaryFile(baseUrl, fileName, abortSignal);
    }
    return this.fetchWithCache(
      key,
      response => response.arrayBuffer(),
      () => this.baseProvider.getBinaryFile(baseUrl, fileName, abortSignal),
      data => data,
      'application/octet-stream'
    );
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    const key = this.resolveCacheKey(baseUrl, fileName);
    if (!key) {
      return this.baseProvider.getJsonFile(baseUrl, fileName);
    }
    const convertToArrayBuffer = (data: unknown): ArrayBuffer => {
      const jsonString = JSON.stringify(data);
      return new TextEncoder().encode(jsonString).buffer;
    };
    return this.fetchWithCache(
      key,
      response => response.json(),
      () => this.baseProvider.getJsonFile(baseUrl, fileName),
      convertToArrayBuffer,
      'application/json'
    );
  }

  /**
   * Resolves the Cache API key for a request. For classic requests, baseUrl+fileName is
   * already stable. For signed URLs (baseUrl empty), the URL itself changes between
   * issuances (fresh SAS token), so the query string is stripped, leaving the stable
   * blob path as the key.
   */
  private resolveCacheKey(baseUrl: string, fileName: string): string | undefined {
    const nullableBaseUrl = baseUrl === '' ? undefined : baseUrl;
    if (nullableBaseUrl !== undefined) {
      return `${nullableBaseUrl}/${fileName}`;
    }
    try {
      return this.buildSignedFileCacheKey(fileName);
    } catch (error) {
      console.warn(`[CachedModelDataProvider] Could not derive cache key from signed URL ${fileName}:`, error);
      return undefined;
    }
  }

  private async fetchWithCache<T>(
    key: string,
    extractFromCache: (response: Response) => Promise<T>,
    fetchFromProvider: () => Promise<T>,
    convertToArrayBuffer: (data: T) => ArrayBuffer,
    contentType: string
  ): Promise<T> {
    try {
      const cached = await this.cacheManager.getCachedResponse(key);
      if (cached) {
        return await extractFromCache(cached);
      }
    } catch (error) {
      console.warn(`[CachedModelDataProvider] Cache read for ${key} failed, falling back to network.`, error);
    }

    const data = await fetchFromProvider();

    const arrayBuffer = convertToArrayBuffer(data);
    await this.cacheManager
      .storeResponse(key, arrayBuffer, contentType)
      .catch(err => console.warn(`[CachedModelDataProvider] Failed to cache ${key}:`, err));

    return data;
  }

  async getFileUrlsForModel(
    baseUrl: string,
    modelIdentifier: ModelIdentifier,
    fileNameFilter?: string
  ): Promise<SignedFileItem[]> {
    if (!this.baseProvider.getFileUrlsForModel) {
      throw new Error('Base provider does not support getFileUrlsForModel');
    }
    return this.baseProvider.getFileUrlsForModel(baseUrl, modelIdentifier, fileNameFilter);
  }

  /**
   * Get the underlying cache manager for direct cache operations
   */
  getCacheManager(): DataFileCacheManager {
    return this.cacheManager;
  }

  /**
   * Check if a file is cached
   */
  async isCached(baseUrl: string, fileName: string): Promise<boolean> {
    const url = `${baseUrl}/${fileName}`;
    return this.cacheManager.has(url);
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    await this.cacheManager.clear();
  }

  private buildSignedFileCacheKey(signedUrl: string): string {
    const url = new URL(signedUrl);
    return `${url.origin}${url.pathname}`;
  }
}
