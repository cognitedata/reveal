/*!
 * Copyright 2026 Cognite AS
 */

import { HttpError } from '@cognite/sdk';
import type { ModelDataProvider } from '../ModelDataProvider';
import type { ModelIdentifier } from '../ModelIdentifier';
import type { SignedFileItem } from '../types';

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
  private readonly dataProvider: ModelDataProvider;
  private readonly inFlightRefreshes = new Map<string, Promise<SignedFileItem | undefined>>();

  constructor(dataProvider: ModelDataProvider) {
    this.dataProvider = dataProvider;
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

    if (signedFilesBaseUrl === undefined || this.dataProvider.getFileUrlsForModel === undefined) {
      throw new Error('Model data provider does not support signed file fetching');
    }

    const found = await this.refresh(signedFilesBaseUrl, modelIdentifier, candidates);
    if (found === undefined) {
      throw new Error(`File "${candidates[0]}" not found in signed files response`);
    }

    onUrlRefreshed?.(found);
    return fetchFn(found.signedUrl);
  }

  private async refresh(
    signedFilesBaseUrl: string,
    modelIdentifier: ModelIdentifier,
    candidates: string[]
  ): Promise<SignedFileItem | undefined> {
    const key = `${signedFilesBaseUrl}|${modelIdentifier.sourceModelIdentifier()}|${candidates[0]}`;
    let promise = this.inFlightRefreshes.get(key);
    if (promise === undefined) {
      promise = this.dataProvider.getFileUrlsForModel!(signedFilesBaseUrl, modelIdentifier, candidates[0])
        .then(items => findSignedFileItem(items, candidates))
        .finally(() => this.inFlightRefreshes.delete(key));
      this.inFlightRefreshes.set(key, promise);
    }
    return promise;
  }
}
