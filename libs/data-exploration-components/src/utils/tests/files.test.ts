import { CogniteClient, FileInfo } from '@cognite/sdk';
import {
  isFileOfType,
  fetchFilePreviewURL,
  mapFileType,
  APPLICATION,
  IMAGE,
  TEXT,
} from '../files';

jest.mock('@cognite/unified-file-viewer', () => {
  return {
    isSupportedFileInfo: jest.fn(() => true),
  };
});
describe('FileUtils', () => {
  describe('isFileOfType', () => {
    it('should return the correct result for a file with MIME type', () => {
      const file: FileInfo = {
        id: 1,
        mimeType: 'image/png',
        name: 'pic.png',
        uploaded: true,
        lastUpdatedTime: new Date(),
        createdTime: new Date(),
      };
      const result = isFileOfType(file, ['png', 'jpeg']);
      expect(result).toBe(true);
    });

    it('should return the correct result for a file without MIME type', () => {
      const file: FileInfo = {
        id: 1,
        name: 'pic.png',
        uploaded: true,
        lastUpdatedTime: new Date(),
        createdTime: new Date(),
      };
      const result = isFileOfType(file, ['png', 'jpeg']);
      expect(result).toBe(true);
    });

    it("should return the correct result if the types don't match", () => {
      const file: FileInfo = {
        id: 1,
        mimeType: 'image/png',
        name: 'pic.png',
        uploaded: true,
        lastUpdatedTime: new Date(),
        createdTime: new Date(),
      };

      const result = isFileOfType(file, ['svg', 'jpeg']);
      expect(result).toBe(false);
    });
  });

  describe('fetchFilePreviewURL', () => {
    const mockSdk = {
      get: () => {
        return { data: Buffer.from([123]) };
      },
      files: {
        getDownloadUrls: () => {
          return [{ downloadUrl: 'https://download.file.com/fileId' }];
        },
      },
      documents: {
        preview: {
          documentAsImage: (
            documentId: number,
            page: number
          ): Promise<ArrayBuffer> => {
            return Promise.resolve(new ArrayBuffer(documentId + page));
          },
        },
      },
    } as unknown as CogniteClient;
    global.URL.createObjectURL = jest.fn(() => 'http://link.to.pdf');

    it('should return a url for a previewable image', async () => {
      const file: FileInfo = {
        id: 1,
        mimeType: 'image/png',
        name: 'pic.png',
        uploaded: true,
        lastUpdatedTime: new Date(),
        createdTime: new Date(),
      };

      const result = await fetchFilePreviewURL(mockSdk, file);
      expect(result).toBe('https://download.file.com/fileId');
    });

    it('should return a url for a PDF', async () => {
      const file: FileInfo = {
        id: 1,
        mimeType: 'application/pdf',
        name: 'doc.pdf',
        uploaded: true,
        lastUpdatedTime: new Date(),
        createdTime: new Date(),
      };

      const result = await fetchFilePreviewURL(mockSdk, file);
      expect(result).toBe('http://link.to.pdf');
    });
  });

  describe('mapFileType', () => {
    it.each([
      [`${APPLICATION}/pdf`, 'PDF'],
      [`${APPLICATION}/msword`, 'Word Document'],
      [`${APPLICATION}/vnd.ms-excel`, 'Excel Sheet'],
      [
        `${APPLICATION}/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
        'Excel Sheet',
      ],
      [`${APPLICATION}/xml`, 'XML'],
      [`${APPLICATION}/zip`, 'Archive'],
      [`${APPLICATION}/7z`, 'Archive'],
      [`${APPLICATION}/vnd.rar`, 'Archive'],
      [`${APPLICATION}/x-tar`, 'Archive'],
      [`${APPLICATION}/plain`, 'Text'],
      [`${APPLICATION}/txt`, 'Text'],
      [`${APPLICATION}/json`, 'JSON'],
      [`${APPLICATION}/octet-stream`, 'Binary'],
      [`${APPLICATION}/csv`, 'CSV'],
      [`${APPLICATION}/x-cit`, 'CIT'],
      [`${APPLICATION}/test`, 'test'],

      [`${TEXT}/pdf`, 'PDF'],
      [`${TEXT}/msword`, 'Word Document'],
      [`${TEXT}/vnd.ms-excel`, 'Excel Sheet'],
      [
        `${TEXT}/vnd.openxmlformats-officedocument.spreadsheetml.sheet`,
        'Excel Sheet',
      ],
      [`${TEXT}/xml`, 'XML'],
      [`${TEXT}/zip`, 'Archive'],
      [`${TEXT}/7z`, 'Archive'],
      [`${TEXT}/vnd.rar`, 'Archive'],
      [`${TEXT}/x-tar`, 'Archive'],
      [`${TEXT}/plain`, 'Text'],
      [`${TEXT}/txt`, 'Text'],
      [`${TEXT}/json`, 'JSON'],
      [`${TEXT}/octet-stream`, 'Binary'],
      [`${TEXT}/csv`, 'CSV'],
      [`${TEXT}/x-cit`, 'CIT'],
      [`${TEXT}/test`, 'test'],

      [`${IMAGE}/dwg`, 'DWG'],
      [`${IMAGE}/x-dfx`, 'vnd.dgn'],
      [`${IMAGE}/svg`, 'SVG'],
      [`${IMAGE}/svg+xml`, 'SVG'],
      [`${IMAGE}/test`, 'Image'],
      ['test', 'test'],
    ])('mapFileType %s %s', (value, expected) => {
      expect(mapFileType(value)).toEqual(expected);
    });
  });
});
