/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
import { HttpError } from '@cognite/sdk';
import { SignedUrlRefresher } from './signedUrlRefresh';
import type { ModelDataProvider } from '../ModelDataProvider';
import { createMockModelDataProvider, mockDMModelIdentifier } from '../../../../test-utilities';

const SIGNED_FILES_BASE_URL = 'https://signed-files.example.com';
const CURRENT_SIGNED_URL = 'https://signed.example.com/file.bin';

describe(SignedUrlRefresher.name, () => {
  test.each<[string, Error]>([
    ['a generic network error', new Error('network down')],
    ['an AbortError', Object.assign(new Error('aborted'), { name: 'AbortError' })]
  ])('fetchWithRefresh() does not attempt a refresh on %s', async (_, error) => {
    const getFileUrlsForModelMock = vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>();
    const refresher = new SignedUrlRefresher(
      createMockModelDataProvider({ getFileUrlsForModel: getFileUrlsForModelMock })
    );

    await expect(
      refresher.fetchWithRefresh({
        currentSignedUrl: CURRENT_SIGNED_URL,
        signedFilesBaseUrl: SIGNED_FILES_BASE_URL,
        modelIdentifier: mockDMModelIdentifier,
        fileName: 'file.bin',
        fetchFn: vi.fn().mockRejectedValueOnce(error)
      })
    ).rejects.toThrow(error.message);

    expect(getFileUrlsForModelMock).not.toHaveBeenCalled();
  });

  test('fetchWithRefresh() de-duplicates concurrent refreshes for the same file', async () => {
    const freshUrl = 'https://signed.example.com/file-fresh.bin';
    const getFileUrlsForModelMock = vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => [
      { fileName: 'file.bin', signedUrl: freshUrl, subPath: '' }
    ]);
    const refresher = new SignedUrlRefresher(
      createMockModelDataProvider({ getFileUrlsForModel: getFileUrlsForModelMock })
    );
    const fetchFn = vi.fn(async (url: string) => url);
    const requestOptions = {
      currentSignedUrl: undefined,
      signedFilesBaseUrl: SIGNED_FILES_BASE_URL,
      modelIdentifier: mockDMModelIdentifier,
      fileName: 'file.bin',
      fetchFn
    };

    const [first, second] = await Promise.all([
      refresher.fetchWithRefresh(requestOptions),
      refresher.fetchWithRefresh(requestOptions)
    ]);

    expect(first).toBe(freshUrl);
    expect(second).toBe(freshUrl);
    expect(getFileUrlsForModelMock).toHaveBeenCalledTimes(1);
  });

  test('fetchWithRefresh() caches a refreshed URL and reuses it on a later call', async () => {
    const staleUrl = 'https://signed.example.com/file-stale.bin';
    const freshUrl = 'https://signed.example.com/file-fresh.bin';
    const filePath = 'ept-data/0-0-0-0.bin';
    const getFileUrlsForModelMock = vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => [
      // Basename-only response still matches when the request uses a path filter.
      { fileName: '0-0-0-0.bin', signedUrl: freshUrl, subPath: '' }
    ]);
    const refresher = new SignedUrlRefresher(
      createMockModelDataProvider({ getFileUrlsForModel: getFileUrlsForModelMock })
    );
    const fetchFn = vi
      .fn(async (url: string) => url)
      .mockRejectedValueOnce(new HttpError(403, { error: { code: 403, message: 'Forbidden' } }, {}));

    const first = await refresher.fetchWithRefresh({
      currentSignedUrl: staleUrl,
      signedFilesBaseUrl: SIGNED_FILES_BASE_URL,
      modelIdentifier: mockDMModelIdentifier,
      fileName: filePath,
      fetchFn
    });
    const second = await refresher.fetchWithRefresh({
      currentSignedUrl: staleUrl,
      signedFilesBaseUrl: SIGNED_FILES_BASE_URL,
      modelIdentifier: mockDMModelIdentifier,
      fileName: filePath,
      fetchFn
    });

    expect(first).toBe(freshUrl);
    expect(second).toBe(freshUrl);
    expect(getFileUrlsForModelMock).toHaveBeenCalledTimes(1);
    expect(getFileUrlsForModelMock).toHaveBeenCalledWith(SIGNED_FILES_BASE_URL, mockDMModelIdentifier, filePath);
    expect(fetchFn).toHaveBeenNthCalledWith(1, staleUrl);
    expect(fetchFn).toHaveBeenNthCalledWith(2, freshUrl);
    expect(fetchFn).toHaveBeenNthCalledWith(3, freshUrl);
  });

  test('fetchWithRefresh() still invokes onUrlRefreshed for external write-back', async () => {
    const freshItem = { fileName: 'file.bin', signedUrl: 'https://signed.example.com/file-fresh.bin', subPath: '' };
    const getFileUrlsForModelMock = vi.fn<NonNullable<ModelDataProvider['getFileUrlsForModel']>>(async () => [
      freshItem
    ]);
    const onUrlRefreshed = vi.fn();
    const refresher = new SignedUrlRefresher(
      createMockModelDataProvider({ getFileUrlsForModel: getFileUrlsForModelMock })
    );

    await refresher.fetchWithRefresh({
      currentSignedUrl: undefined,
      signedFilesBaseUrl: SIGNED_FILES_BASE_URL,
      modelIdentifier: mockDMModelIdentifier,
      fileName: 'file.bin',
      fetchFn: async url => url,
      onUrlRefreshed
    });

    expect(onUrlRefreshed).toHaveBeenCalledTimes(1);
    expect(onUrlRefreshed).toHaveBeenCalledWith(freshItem);
  });
});
