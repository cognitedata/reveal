/*!
 * Copyright 2025 Cognite AS
 */

import type { ModelDataProvider } from '../ModelDataProvider';
import type { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';
import type { DMSModelFilesBundle } from '../types';
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

  getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer>;
  getBinaryFile(signedUrl: string, abortSignal?: AbortSignal): Promise<ArrayBuffer>;
  async getBinaryFile(
    baseOrSigned: string,
    fileNameOrAbortSignal?: string | AbortSignal,
    abortSignal?: AbortSignal
  ): Promise<ArrayBuffer> {
    if (typeof fileNameOrAbortSignal === 'string') {
      const fileName = fileNameOrAbortSignal;
      return this.fetchWithCache(
        baseOrSigned,
        fileName,
        response => response.arrayBuffer(),
        () => this.baseProvider.getBinaryFile(baseOrSigned, fileName, abortSignal),
        data => data,
        'application/octet-stream'
      );
    }
    const signal = fileNameOrAbortSignal instanceof AbortSignal ? fileNameOrAbortSignal : abortSignal;
    return this.baseProvider.getBinaryFile(baseOrSigned, signal);
  }

  getJsonFile<T = unknown>(baseUrl: string, fileName: string): Promise<T>;
  getJsonFile<T = unknown>(signedUrl: string): Promise<T>;
  async getJsonFile<T = unknown>(baseOrSigned: string, fileName?: string): Promise<T> {
    if (fileName !== undefined) {
      const convertToArrayBuffer = (data: T): ArrayBuffer => {
        const jsonString = JSON.stringify(data);
        return new TextEncoder().encode(jsonString).buffer;
      };
      return this.fetchWithCache<T>(
        baseOrSigned,
        fileName,
        response => response.json(),
        () => this.baseProvider.getJsonFile<T>(baseOrSigned, fileName),
        convertToArrayBuffer,
        'application/json'
      );
    }
    return this.baseProvider.getJsonFile<T>(baseOrSigned);
  }

  private async fetchWithCache<T>(
    baseUrl: string,
    fileName: string,
    extractFromCache: (response: Response) => Promise<T>,
    fetchFromProvider: () => Promise<T>,
    convertToArrayBuffer: (data: T) => ArrayBuffer,
    contentType: string
  ): Promise<T> {
    const url = `${baseUrl}/${fileName}`;

    try {
      const cached = await this.cacheManager.getCachedResponse(url);
      if (cached) {
        return await extractFromCache(cached);
      }
    } catch (error) {
      console.warn(`[CachedModelDataProvider] Cache read for ${url} failed, falling back to network.`, error);
    }

    const data = await fetchFromProvider();

    const arrayBuffer = convertToArrayBuffer(data);
    await this.cacheManager
      .storeResponse(url, arrayBuffer, contentType)
      .catch(err => console.warn(`[CachedModelDataProvider] Failed to cache ${url}:`, err));

    return data;
  }

  async getDMSJsonFile(
    baseUrl: string,
    modelIdentifier: DMModelIdentifier,
    fileName: string
  ): Promise<DMSModelFilesBundle> {
    return this.baseProvider.getDMSJsonFile(baseUrl, modelIdentifier, fileName);
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
}
