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

function findSignedFileItem(items: SignedFileItem[], candidates: string[]): SignedFileItem | undefined {
  return items.find(item =>
    candidates.some(candidate => item.fileName === candidate || item.fileName.endsWith('/' + candidate))
  );
}

type FetchWithRefreshOptions<T> = {
  currentSignedUrl: string | undefined;
  signedFilesBaseUrl: string | undefined;
  modelIdentifier: ModelIdentifier;
  candidates: string[];
  fetchFn: (signedUrl: string) => Promise<T>;
  onUrlRefreshed?: (item: SignedFileItem) => void;
};

/**
 * Fetches a resource through a signed URL, transparently refreshing the URL and retrying once
 * if the current URL has expired or is otherwise invalid (HTTP 401/403/404). Concurrent refresh
 * requests for the same file are de-duplicated.
 */
export class SignedUrlRefresher {
  private readonly _dataProvider: ModelDataProvider;
  private readonly _inFlightRefreshes = new Map<string, Promise<SignedFileItem | undefined>>();

  constructor(dataProvider: ModelDataProvider) {
    this._dataProvider = dataProvider;
  }

  async fetchWithRefresh<T>(options: FetchWithRefreshOptions<T>): Promise<T> {
    const { currentSignedUrl, signedFilesBaseUrl, modelIdentifier, candidates, fetchFn, onUrlRefreshed } = options;

    if (currentSignedUrl !== undefined) {
      try {
        return await fetchFn(currentSignedUrl);
      } catch (error) {
        if (!isExpiredOrInvalidSignedUrlError(error)) {
          throw error;
        }
      }
    }

    if (signedFilesBaseUrl !== undefined && this._dataProvider.getFileUrlsForModel !== undefined) {
      const found = await this.refresh(
        signedFilesBaseUrl,
        modelIdentifier,
        candidates,
        (signedFilesBaseUrl: string, modelIdentifier: ModelIdentifier, fileName: string | undefined) => {
          assert(
            this._dataProvider.getFileUrlsForModel !== undefined,
            'Model data provider does not support signed file fetching'
          );
          return this._dataProvider.getFileUrlsForModel(signedFilesBaseUrl, modelIdentifier, fileName);
        }
      );
      if (found === undefined) {
        throw new Error(`File "${candidates[0]}" not found in signed files response`);
      }

      onUrlRefreshed?.(found);
      return fetchFn(found.signedUrl);
    }
    throw new Error('Model data provider does not support signed file fetching');
  }

  private async refresh(
    signedFilesBaseUrl: string,
    modelIdentifier: ModelIdentifier,
    candidates: string[],
    getFilesFn: (
      signedFilesBaseUrl: string,
      modelIdentifier: ModelIdentifier,
      fileName: string | undefined
    ) => Promise<SignedFileItem[]>
  ): Promise<SignedFileItem | undefined> {
    const key = `${signedFilesBaseUrl}|${modelIdentifier.sourceModelIdentifier()}|${candidates[0]}`;
    let promise = this._inFlightRefreshes.get(key);
    if (promise === undefined) {
      promise = getFilesFn(signedFilesBaseUrl, modelIdentifier, candidates[0])
        .then(items => findSignedFileItem(items, candidates))
        .finally(() => this._inFlightRefreshes.delete(key));
      this._inFlightRefreshes.set(key, promise);
    }
    return promise;
  }
}
