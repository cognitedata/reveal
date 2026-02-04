/*!
 * Copyright 2025 Cognite AS
 */

import { jest } from '@jest/globals';
import { CogniteClient } from '@cognite/sdk';
import { Mock } from 'moq.ts';
import { CdfImageFileProvider } from './CdfImageFileProvider';

describe(CdfImageFileProvider.name, () => {
  let mockClient: CogniteClient;
  let provider: CdfImageFileProvider;
  let fetchSpy: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');

    mockClient = new Mock<CogniteClient>()
      .setup(c => c.getBaseUrl())
      .returns('https://example.com')
      .setup(c => c.project)
      .returns('test-project')
      .setup(c => c.getDefaultRequestHeaders())
      .returns({ Authorization: 'Bearer token' })
      .object();

    provider = new CdfImageFileProvider(mockClient);
  });

  describe('getFileBuffersWithMimeType', () => {
    test('fetches files and extracts mimeType from Content-Type header', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }, { id: 456 }];

      // Mock downloadlink response
      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          items: [
            { id: 123, downloadUrl: 'https://storage.example.com/file1.jpg' },
            { id: 456, downloadUrl: 'https://storage.example.com/file2.png' }
          ]
        })
      );

      // Mock file download responses
      mockFetch.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(100), 'image/jpeg'));
      mockFetch.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(200), 'image/png'));

      const results = await provider.getFileBuffersWithMimeType(fileIdentifiers);

      expect(results).toHaveLength(2);
      expect(results[0].mimeType).toBe('image/jpeg');
      expect(results[1].mimeType).toBe('image/png');
    });

    test('defaults to image/jpeg when Content-Type is missing', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ externalId: 'file-1' }];

      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          items: [{ externalId: 'file-1', downloadUrl: 'https://storage.example.com/file1' }]
        })
      );

      mockFetch.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(100), null));

      const results = await provider.getFileBuffersWithMimeType(fileIdentifiers);

      expect(results).toHaveLength(1);
      expect(results[0].mimeType).toBe('image/jpeg');
    });

    test('throws error when download fails', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }];

      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          items: [{ id: 123, downloadUrl: 'https://storage.example.com/file1.jpg' }]
        })
      );

      mockFetch.mockResolvedValueOnce(createErrorResponse(404, 'Not Found'));

      await expect(provider.getFileBuffersWithMimeType(fileIdentifiers)).rejects.toThrow(
        'Failed to fetch file: 404 Not Found'
      );
    });
  });

  describe('getFileBuffers', () => {
    test('returns only ArrayBuffer data without mimeType', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }];

      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          items: [{ id: 123, downloadUrl: 'https://storage.example.com/file1.jpg' }]
        })
      );

      mockFetch.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(100), 'image/jpeg'));

      const results = await provider.getFileBuffers(fileIdentifiers);

      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('getIconBuffersWithMimeType', () => {
    test('fetches icons using internal IDs directly', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }, { id: 456 }];

      // Mock icon responses
      mockFetch.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(50), 'image/jpeg'));
      mockFetch.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(60), 'image/jpeg'));

      const results = await provider.getIconBuffersWithMimeType(fileIdentifiers);

      expect(results).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/files/icon?id=123'), expect.any(Object));
    });

    test('resolves external IDs via download URLs before fetching icons', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ externalId: 'file-ext-1' }];

      // Mock downloadlink response - URL contains encoded fileId
      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          items: [
            {
              externalId: 'file-ext-1',
              downloadUrl: 'https://example.com/api/v1/files/storage/cognite/12345%2F67890%2Fimage.jpeg'
            }
          ]
        })
      );

      // Mock icon response
      mockFetch.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(50), 'image/jpeg'));

      const results = await provider.getIconBuffersWithMimeType(fileIdentifiers);

      expect(results).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/files/icon?id=67890'), expect.any(Object));
    });

    test('handles mixed identifier types', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 111 }, { externalId: 'file-ext' }, { id: 222 }];

      // Mock downloadlink for externalId
      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          items: [
            {
              externalId: 'file-ext',
              downloadUrl: 'https://example.com/api/v1/files/storage/cognite/99%2F333%2Fimage.jpeg'
            }
          ]
        })
      );

      // Mock icon responses (3 total)
      mockFetch.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(10), 'image/jpeg'));
      mockFetch.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(20), 'image/jpeg'));
      mockFetch.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(30), 'image/jpeg'));

      const results = await provider.getIconBuffersWithMimeType(fileIdentifiers);

      expect(results).toHaveLength(3);
    });

    test('returns empty array for empty input', async () => {
      const results = await provider.getIconBuffersWithMimeType([]);
      expect(results).toHaveLength(0);
    });

    test('throws error when icon fetch fails', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }];

      mockFetch.mockResolvedValueOnce(createErrorResponse(500, 'Internal Server Error'));

      await expect(provider.getIconBuffersWithMimeType(fileIdentifiers)).rejects.toThrow(
        'Failed to fetch icon: 500 Internal Server Error'
      );
    });
  });

  describe('getIconBuffers', () => {
    test('returns only ArrayBuffer data', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }];

      mockFetch.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(50), 'image/jpeg'));

      const results = await provider.getIconBuffers(fileIdentifiers);

      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('getDownloadUrls (via getFileBuffersWithMimeType)', () => {
    test('handles externalId identifiers', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ externalId: 'my-file' }];

      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          items: [{ externalId: 'my-file', downloadUrl: 'https://storage.example.com/file.jpg' }]
        })
      );

      mockFetch.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(100), 'image/jpeg'));

      await provider.getFileBuffersWithMimeType(fileIdentifiers);

      // Verify the POST body contains externalId
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/files/downloadlink'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ items: [{ externalId: 'my-file' }] })
        })
      );
    });

    test('handles instanceId identifiers', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ instanceId: { space: 'my-space', externalId: 'my-instance' } }];

      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          items: [{ downloadUrl: 'https://storage.example.com/file.jpg' }]
        })
      );

      mockFetch.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(100), 'image/jpeg'));

      await provider.getFileBuffersWithMimeType(fileIdentifiers);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/files/downloadlink'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ items: [{ instanceId: { space: 'my-space', externalId: 'my-instance' } }] })
        })
      );
    });

    test('throws error when downloadlink request fails', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }];

      mockFetch.mockResolvedValueOnce(createErrorResponse(400, 'Bad Request'));

      await expect(provider.getFileBuffersWithMimeType(fileIdentifiers)).rejects.toThrow(
        'Failed to get download URLs: 400 Bad Request'
      );
    });
  });

  describe('parseMimeType', () => {
    test('recognizes image/jpg as jpeg', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }];

      mockFetch.mockResolvedValueOnce(
        createJsonResponse({
          items: [{ id: 123, downloadUrl: 'https://storage.example.com/file.jpg' }]
        })
      );

      mockFetch.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(100), 'image/jpg'));

      const results = await provider.getFileBuffersWithMimeType(fileIdentifiers);

      expect(results[0].mimeType).toBe('image/jpeg');
    });
  });
});
