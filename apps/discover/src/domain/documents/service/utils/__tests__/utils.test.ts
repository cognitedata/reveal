import '__mocks/mockContainerAuth';
import '__mocks/mockCogniteSDK';
import { getMockFilesByIds } from 'domain/documents/service/__mocks/getMockFilesByIds';
import { getMockFilesDownloadLink } from 'domain/documents/service/__mocks/getMockFilesDownloadLink';

import { saveAs } from 'file-saver';
import fetchMock from 'jest-fetch-mock';
import { setupServer } from 'msw/node';

import { InternalId, ExternalId, FileLink } from '@cognite/sdk';

import {
  getMockDocument,
  getMockFileLinkWithInternalId,
  getMockFileLinkWithExternalId,
} from '__test-utils/fixtures/document';
import {
  getMockFilesDownloadLinkEndpoint,
  MOCK_DOWNLOAD_URL,
} from 'modules/documentSearch/__mocks/getMockFilesDownloadLinkEndpoint';

import * as getTemporaryPreviewLink from '../../network/getTemporaryPreviewLink';
import {
  getDocIdFromSignedUrlResponse,
  zipFavoritesAndDownload,
  getFavoriteContentForZipping,
  downloadFile,
  downloadFileFromUrl,
  openDocumentPreviewInNewTab,
  bufferDataToImageUrl,
} from '../utils';

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

const filename = 'document.pdf';
const documents = [getMockDocument({}, { filename })];

describe('documentPreview -> utils', () => {
  const mockServer = setupServer(
    getMockFilesDownloadLink({
      items: documents.map((document) => ({
        externalId: document?.externalId || '1',
        downloadUrl: MOCK_DOWNLOAD_URL,
      })),
    }),
    getMockFilesDownloadLinkEndpoint(),
    getMockFilesByIds()
  );

  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());
  beforeEach(() => {
    mockServer.resetHandlers();
    jest.clearAllMocks();
    fetchMock.mockClear();
  });

  describe('downloadFileFromUrl', () => {
    it('should call `downloadFileFromUrl` as expected', async () => {
      const openSpy = jest
        .spyOn(window, 'open')
        .mockImplementation(() => window);

      await downloadFileFromUrl('12345');
      expect(openSpy).toBeCalledTimes(1);
    });
  });

  describe('getFavoriteContentForZipping', () => {
    it('should throw error as expected', async () => {
      await expect(getFavoriteContentForZipping([])).rejects.toThrowError(
        'No files to download'
      );
    });

    // this is failing from vite, need to find out how to clear the fetch mocks
    // -it('should return result as expected', async () => {
    //   const favoriteContentForZipping = await getFavoriteContentForZipping(
    //     documents
    //   );

    //   expect(favoriteContentForZipping).toEqual([
    //     { blob: Promise.resolve({}), filename },
    //   ]);
    // });
  });

  describe('downloadFile', () => {
    it('should call `saveAs` as expected', async () => {
      downloadFile('document.pdf');
      expect(saveAs).toBeCalledTimes(1);
    });
  });

  describe('openDocumentPreviewInNewTab', () => {
    it('should call `openDocumentPreviewInNewTab` as expected', async () => {
      const getTemporaryPreviewLinkSpy = jest
        .spyOn(getTemporaryPreviewLink, 'getTemporaryPreviewLink')
        .mockImplementation(() => Promise.resolve('getTemporaryPreviewLink'));

      await openDocumentPreviewInNewTab('12345');
      expect(getTemporaryPreviewLinkSpy).toBeCalledTimes(1);
    });
  });

  describe('getDocIdFromSignedUrlResponse', () => {
    it('should return response when internalId is provided', () => {
      const response: FileLink & InternalId = getMockFileLinkWithInternalId();
      const id = '12345';
      expect(getDocIdFromSignedUrlResponse([response], id)).toEqual(response);
    });

    it('should return response when externalId is provided', () => {
      const response: FileLink & ExternalId = getMockFileLinkWithExternalId();
      const id = '12345';
      expect(getDocIdFromSignedUrlResponse([response], id, id)).toEqual(
        response
      );
    });

    it('should not return response when typeof id is number', () => {
      const response: FileLink & InternalId = getMockFileLinkWithInternalId();
      const id = 12345;
      expect(getDocIdFromSignedUrlResponse([response], id)).toBeFalsy();
    });

    it('should not return response when no response is passed', () => {
      const id = 12345;
      expect(getDocIdFromSignedUrlResponse([], id)).toBeFalsy();
    });
    it('should return empty document url for empty Uint8Array array', () => {
      const bufferArr = new ArrayBuffer(12000);
      expect(bufferDataToImageUrl(bufferArr)).toBeFalsy();
    });
  });

  describe('zipFavoritesAndDownload', () => {
    it('should throw error when document is null', async () => {
      await expect(zipFavoritesAndDownload([])).rejects.toThrowError();
    });
  });
});
