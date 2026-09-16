/*!
 * Copyright 2026 Cognite AS
 */

import { HttpError } from '@cognite/sdk';
import type { ModelDataProvider } from '../ModelDataProvider';
import type { ModelIdentifier } from '../ModelIdentifier';
import type { SignedFileItem } from '../types';
import { assert } from '@reveal/utilities/assert';

const EXPIRED_OR_INVALID_SIGNED_URL_STATUSES = [401, 403, 404];

function isExpiredOrInvalidSignedUrlError(error: unknown): boolean {
  return error instanceof HttpError && EXPIRED_OR_INVALID_SIGNED_URL_STATUSES.includes(error.status);
}

function baseName(fileName: string): string {
  const lastSlash = fileName.lastIndexOf('/');
  return lastSlash === -1 ? fileName : fileName.substring(lastSlash + 1);
}

function findSignedFileItem(items: SignedFileItem[], fileName: string): SignedFileItem | undefined {
  const fileBaseName = baseName(fileName);
  return items.find(
    item =>
      item.fileName === fileName ||
      item.fileName === fileBaseName ||
      item.fileName.endsWith('/' + fileName) ||
      item.fileName.endsWith('/' + fileBaseName)
  );
}

export type FetchWithRefreshOptions<T> = {
  currentSignedUrl: string | undefined;
  signedFilesBaseUrl: string | undefined;
  modelIdentifier: ModelIdentifier;
  fileName: string;
  fetchFn: (signedUrl: string) => Promise<T>;
  onUrlRefreshed?: (item: SignedFileItem) => void;
};

/**
 * Fetches a resource through a signed URL, transparently refreshing the URL and retrying once
 * if the current URL has expired or is otherwise invalid (HTTP 401/403/404). Concurrent refresh
 * requests for the same file are de-duplicated. Successfully refreshed URLs are cached and
 * preferred over the originally supplied `currentSignedUrl` on later calls.
 */
export class SignedUrlRefresher {
  private readonly _dataProvider: ModelDataProvider;
  private readonly _inFlightRefreshes = new Map<string, Promise<SignedFileItem | undefined>>();
  private readonly _refreshedSignedUrls = new Map<string, string>();

  constructor(dataProvider: ModelDataProvider) {
    this._dataProvider = dataProvider;
  }

  async fetchWithRefresh<T>(options: FetchWithRefreshOptions<T>): Promise<T> {
    const { signedFilesBaseUrl, modelIdentifier, fileName, fetchFn, onUrlRefreshed } = options;

    const { cacheKey, currentSignedUrl } = this.resolveCurrentSignedUrl(
      signedFilesBaseUrl,
      modelIdentifier,
      fileName,
      options.currentSignedUrl
    );

    if (currentSignedUrl !== undefined) {
      try {
        return await fetchFn(currentSignedUrl);
      } catch (error) {
        if (!isExpiredOrInvalidSignedUrlError(error)) {
          throw error;
        }
      }
    }

    return this.tryRefresh(signedFilesBaseUrl, modelIdentifier, fileName, cacheKey, fetchFn, onUrlRefreshed);
  }

  private resolveCurrentSignedUrl(
    signedFilesBaseUrl: string | undefined,
    modelIdentifier: ModelIdentifier,
    fileName: string,
    fallbackSignedUrl: string | undefined
  ): { cacheKey: string | undefined; currentSignedUrl: string | undefined } {
    const cacheKey =
      signedFilesBaseUrl !== undefined && fileName !== ''
        ? this.cacheKey(signedFilesBaseUrl, modelIdentifier, fileName)
        : undefined;
    const currentSignedUrl =
      (cacheKey !== undefined ? this._refreshedSignedUrls.get(cacheKey) : undefined) ?? fallbackSignedUrl;
    return { cacheKey, currentSignedUrl };
  }

  private cacheKey(signedFilesBaseUrl: string, modelIdentifier: ModelIdentifier, fileName: string): string {
    return `${signedFilesBaseUrl}|${modelIdentifier.sourceModelIdentifier()}|${fileName}`;
  }

  private async tryRefresh<T>(
    signedFilesBaseUrl: string | undefined,
    modelIdentifier: ModelIdentifier,
    fileName: string,
    cacheKey: string | undefined,
    fetchFn: (signedUrl: string) => Promise<T>,
    onUrlRefreshed?: (item: SignedFileItem) => void
  ): Promise<T> {
    if (signedFilesBaseUrl !== undefined && this._dataProvider.getFileUrlsForModel !== undefined) {
      const key = this.cacheKey(signedFilesBaseUrl, modelIdentifier, fileName);
      let promiseFound = this._inFlightRefreshes.get(key);
      if (promiseFound === undefined) {
        assert(
          this._dataProvider.getFileUrlsForModel !== undefined,
          'Model data provider does not support signed file fetching'
        );
        promiseFound = this._dataProvider
          .getFileUrlsForModel(signedFilesBaseUrl, modelIdentifier, fileName)
          .then(items => findSignedFileItem(items, fileName))
          .finally(() => this._inFlightRefreshes.delete(key));
        this._inFlightRefreshes.set(key, promiseFound);
      }
      const found = await promiseFound;
      if (found === undefined) {
        throw new Error(`File "${fileName}" not found in signed files response`);
      }

      if (cacheKey !== undefined) {
        this._refreshedSignedUrls.set(cacheKey, found.signedUrl);
      }
      onUrlRefreshed?.(found);
      return fetchFn(found.signedUrl);
    }
    throw new Error('Model data provider does not support signed file fetching');
  }
}
