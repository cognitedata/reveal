import { CogniteClient, FileInfo } from '@cognite/sdk';
import { isFileOfType, fetchFilePreviewURL } from '../files';

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
});
