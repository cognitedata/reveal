/*!
 * Copyright 2026 Cognite AS
 */

import { vi } from 'vitest';
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
        candidates: ['file.bin'],
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
      candidates: ['file.bin'],
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
});
