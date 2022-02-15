import { saveAs } from 'file-saver';

import { InternalId, ExternalId, FileLink } from '@cognite/sdk';

import {
  getMockDocument,
  getMockFileLinkWithInternalId,
  getMockFileLinkWithExternalId,
} from '__test-utils/fixtures/document';
import { getMockFavoriteDocumentData } from '__test-utils/fixtures/favorite';

import * as service from '../service';
import {
  getDocIdFromSignedUrlResponse,
  zipAndDownload,
  zipAndDownloadDocumentsByIds,
  zipFavoritesAndDownload,
  getFavoriteContentForZipping,
  getDocumentContentForZipping,
  downloadFile,
  downloadFileFromUrl,
  openDocumentPreviewInNewTab,
  bufferDataToImageUrl,
} from '../utils';

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

describe('documentPreview -> utils', () => {
  describe('getDocIdFromSignedUrlResponse', () => {
    it('should return response when internalId is provided', () => {
      const response: FileLink & InternalId = getMockFileLinkWithInternalId();
      const id = '12345';
      expect(getDocIdFromSignedUrlResponse([response], id)).toEqual(response);
    });

    it('should return response when externalId is provided', () => {
      const response: FileLink & ExternalId = getMockFileLinkWithExternalId();
      const id = '12345';
      expect(getDocIdFromSignedUrlResponse([response], id)).toEqual(response);
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

  describe('zipAndDownload', () => {
    it('should throw error when document is null', async () => {
      await expect(zipAndDownload([])).rejects.toThrowError();
    });
  });

  describe('zipAndDownloadDocumentsByIds', () => {
    it('should throw error as expected', async () => {
      await expect(zipAndDownloadDocumentsByIds([])).rejects.toThrowError(
        'No files to download'
      );
    });

    it('should return a not null result', () => {
      expect(zipAndDownloadDocumentsByIds([12345])).toBeTruthy();
    });
  });

  describe('zipFavoritesAndDownload', () => {
    it('should throw error when document is null', async () => {
      await expect(zipFavoritesAndDownload([])).rejects.toThrowError();
    });
  });

  describe('getFavoriteContentForZipping', () => {
    it('should throw error as expected', async () => {
      await expect(getFavoriteContentForZipping([])).rejects.toThrowError(
        'No files to download'
      );
    });

    it('should return a not null result', () => {
      const documents = [getMockFavoriteDocumentData()];
      expect(getFavoriteContentForZipping(documents)).toBeTruthy();
    });

    it('should return result as expected', async () => {
      const filename = 'document.pdf';
      const documents = [getMockFavoriteDocumentData({ name: filename })];
      const favoriteContentForZipping = await getFavoriteContentForZipping(
        documents
      );
      expect(favoriteContentForZipping).toEqual([
        { blob: Promise.resolve({}), filename },
      ]);
    });
  });

  describe('getDocumentContentForZipping', () => {
    it('should throw error as expected', async () => {
      await expect(getDocumentContentForZipping([])).rejects.toThrowError(
        'No files to download'
      );
    });

    it('should return a not null result', () => {
      const documents = [getMockDocument()];
      expect(getDocumentContentForZipping(documents)).toBeTruthy();
    });

    it('should return result as expected', async () => {
      const filename = 'document.pdf';
      const documents = [getMockDocument({ filename }, { filename })];
      const documentContentForZipping = await getDocumentContentForZipping(
        documents
      );
      expect(documentContentForZipping).toEqual([
        { blob: Promise.resolve({}), filename },
      ]);
    });
  });

  describe('downloadFile', () => {
    it('should call `saveAs` as expected', async () => {
      downloadFile('document.pdf');
      expect(saveAs).toBeCalledTimes(1);
    });
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

  describe('openDocumentPreviewInNewTab', () => {
    it('should call `openDocumentPreviewInNewTab` as expected', async () => {
      const getTemporaryPreviewLinkSpy = jest
        .spyOn(service, 'getTemporaryPreviewLink')
        .mockImplementation(() => Promise.resolve('getTemporaryPreviewLink'));

      await openDocumentPreviewInNewTab('12345');
      expect(getTemporaryPreviewLinkSpy).toBeCalledTimes(1);
    });
  });
});
