/*!
 * Copyright 2025 Cognite AS
 */

import { jest } from '@jest/globals';
import { CogniteClient } from '@cognite/sdk';
import { Mock } from 'moq.ts';
import { CdfImageFileProvider, FileIdentifier } from './CdfImageFileProvider';

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

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('getFileBuffersWithMimeType', () => {
    test('fetches files and extracts mimeType from Content-Type header', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }, { id: 456 }];

      fetchSpy
        .mockResolvedValueOnce(
          createJsonResponse({
            items: [
              { id: 123, downloadUrl: 'https://storage.example.com/file1.jpg' },
              { id: 456, downloadUrl: 'https://storage.example.com/file2.png' }
            ]
          })
        )
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(100), 'image/jpeg'))
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(200), 'image/png'));

      const results = await provider.getFileBuffersWithMimeType(fileIdentifiers);

      expect(results).toHaveLength(2);
      expect(results[0].mimeType).toBe('image/jpeg');
      expect(results[1].mimeType).toBe('image/png');
    });

    test('defaults to image/jpeg when Content-Type is missing', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ externalId: 'file-1' }];

      fetchSpy
        .mockResolvedValueOnce(
          createJsonResponse({
            items: [{ externalId: 'file-1', downloadUrl: 'https://storage.example.com/file1' }]
          })
        )
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(100), null));

      const results = await provider.getFileBuffersWithMimeType(fileIdentifiers);

      expect(results).toHaveLength(1);
      expect(results[0].mimeType).toBe('image/jpeg');
    });

    test('throws error when download fails', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }];

      fetchSpy
        .mockResolvedValueOnce(
          createJsonResponse({
            items: [{ id: 123, downloadUrl: 'https://storage.example.com/file1.jpg' }]
          })
        )
        .mockResolvedValueOnce(createErrorResponse(404, 'Not Found'));

      await expect(provider.getFileBuffersWithMimeType(fileIdentifiers)).rejects.toThrow(
        'Failed to fetch file: 404 Not Found'
      );
    });
  });

  describe('getFileBuffers', () => {
    test('returns only ArrayBuffer data without mimeType', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }];

      fetchSpy
        .mockResolvedValueOnce(
          createJsonResponse({
            items: [{ id: 123, downloadUrl: 'https://storage.example.com/file1.jpg' }]
          })
        )
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(100), 'image/jpeg'));

      const results = await provider.getFileBuffers(fileIdentifiers);

      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('getIconBuffersWithMimeType', () => {
    test('fetches icons using internal IDs directly', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }, { id: 456 }];

      fetchSpy
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(50), 'image/jpeg'))
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(60), 'image/jpeg'));

      const results = await provider.getIconBuffersWithMimeType(fileIdentifiers);

      expect(results).toHaveLength(2);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/files/icon?id=123'), expect.any(Object));
    });

    test('uses id from downloadlink response when available', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ externalId: 'file-ext-1' }];

      fetchSpy
        .mockResolvedValueOnce(
          createJsonResponse({
            items: [
              {
                id: 99999,
                externalId: 'file-ext-1',
                downloadUrl: 'https://example.com/some/path/file.jpeg'
              }
            ]
          })
        )
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(50), 'image/jpeg'));

      const results = await provider.getIconBuffersWithMimeType(fileIdentifiers);

      expect(results).toHaveLength(1);
      expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/files/icon?id=99999'), expect.any(Object));
    });

    test('falls back to URL parsing when id not in response', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ externalId: 'file-ext-1' }];

      fetchSpy
        .mockResolvedValueOnce(
          createJsonResponse({
            items: [
              {
                externalId: 'file-ext-1',
                downloadUrl: 'https://example.com/api/v1/files/gcs_proxy/bucket/1234567890123/9876543210987/image.jpeg'
              }
            ]
          })
        )
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(50), 'image/jpeg'));

      const results = await provider.getIconBuffersWithMimeType(fileIdentifiers);

      expect(results).toHaveLength(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/files/icon?id=9876543210987'),
        expect.any(Object)
      );
    });

    test('throws error when id cannot be resolved', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ externalId: 'file-ext-1' }];

      fetchSpy.mockResolvedValueOnce(
        createJsonResponse({
          items: [
            {
              externalId: 'file-ext-1',
              downloadUrl: 'https://example.com/some/path/file.jpeg'
            }
          ]
        })
      );

      await expect(provider.getIconBuffersWithMimeType(fileIdentifiers)).rejects.toThrow(
        'Could not resolve internal file ID for'
      );
    });

    test('handles mixed identifier types', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 111 }, { externalId: 'file-ext' }, { id: 222 }];

      fetchSpy
        .mockResolvedValueOnce(
          createJsonResponse({
            items: [
              {
                id: 3333333333333,
                externalId: 'file-ext',
                downloadUrl: 'https://example.com/storage/file.jpeg'
              }
            ]
          })
        )
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(10), 'image/jpeg'))
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(20), 'image/jpeg'))
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(30), 'image/jpeg'));

      const results = await provider.getIconBuffersWithMimeType(fileIdentifiers);

      expect(results).toHaveLength(3);
    });

    test('returns empty array for empty input', async () => {
      const results = await provider.getIconBuffersWithMimeType([]);
      expect(results).toHaveLength(0);
    });

    test('throws error when icon fetch fails', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }];

      fetchSpy.mockResolvedValueOnce(createErrorResponse(500, 'Internal Server Error'));

      await expect(provider.getIconBuffersWithMimeType(fileIdentifiers)).rejects.toThrow(
        'Failed to fetch icon: 500 Internal Server Error'
      );
    });
  });

  describe('getIconBuffers', () => {
    test('returns only ArrayBuffer data', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }];

      fetchSpy.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(50), 'image/jpeg'));

      const results = await provider.getIconBuffers(fileIdentifiers);

      expect(results).toHaveLength(1);
      expect(results[0]).toBeInstanceOf(ArrayBuffer);
    });
  });

  describe('getDownloadUrls (via getFileBuffersWithMimeType)', () => {
    test('handles externalId identifiers', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ externalId: 'my-file' }];

      fetchSpy
        .mockResolvedValueOnce(
          createJsonResponse({
            items: [{ externalId: 'my-file', downloadUrl: 'https://storage.example.com/file.jpg' }]
          })
        )
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(100), 'image/jpeg'));

      await provider.getFileBuffersWithMimeType(fileIdentifiers);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/files/downloadlink'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ items: [{ externalId: 'my-file' }] })
        })
      );
    });

    test('handles instanceId identifiers', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ instanceId: { space: 'my-space', externalId: 'my-instance' } }];

      fetchSpy
        .mockResolvedValueOnce(
          createJsonResponse({
            items: [{ downloadUrl: 'https://storage.example.com/file.jpg' }]
          })
        )
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(100), 'image/jpeg'));

      await provider.getFileBuffersWithMimeType(fileIdentifiers);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/files/downloadlink'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ items: [{ instanceId: { space: 'my-space', externalId: 'my-instance' } }] })
        })
      );
    });

    test('throws error when downloadlink request fails', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }];

      fetchSpy.mockResolvedValueOnce(createErrorResponse(400, 'Bad Request'));

      await expect(provider.getFileBuffersWithMimeType(fileIdentifiers)).rejects.toThrow(
        'Failed to get download URLs: 400 Bad Request'
      );
    });
  });

  describe('parseMimeType', () => {
    test('recognizes image/jpg as jpeg', async () => {
      const fileIdentifiers: FileIdentifier[] = [{ id: 123 }];

      fetchSpy
        .mockResolvedValueOnce(
          createJsonResponse({
            items: [{ id: 123, downloadUrl: 'https://storage.example.com/file.jpg' }]
          })
        )
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(100), 'image/jpg'));

      const results = await provider.getFileBuffersWithMimeType(fileIdentifiers);

      expect(results[0].mimeType).toBe('image/jpeg');
    });
  });

  function createJsonResponse(data: unknown, ok = true, status = 200, statusText = 'OK'): Response {
    return {
      ok,
      status,
      statusText,
      json: () => Promise.resolve(data),
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      url: '',
      clone: () => createJsonResponse(data, ok, status, statusText),
      body: null,
      bodyUsed: false,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      blob: () => Promise.resolve(new Blob()),
      formData: () => Promise.resolve(new FormData()),
      text: () => Promise.resolve(JSON.stringify(data)),
      bytes: () => Promise.resolve(new Uint8Array())
    };
  }

  function createBinaryResponse(
    data: ArrayBuffer,
    contentType: string | null,
    ok = true,
    status = 200,
    statusText = 'OK'
  ): Response {
    const headers = new Headers();
    if (contentType) {
      headers.set('Content-Type', contentType);
    }
    return {
      ok,
      status,
      statusText,
      headers,
      arrayBuffer: () => Promise.resolve(data),
      redirected: false,
      type: 'basic',
      url: '',
      clone: () => createBinaryResponse(data, contentType, ok, status, statusText),
      body: null,
      bodyUsed: false,
      json: () => Promise.reject(new Error('Not JSON')),
      blob: () => Promise.resolve(new Blob([data])),
      formData: () => Promise.resolve(new FormData()),
      text: () => Promise.resolve(''),
      bytes: () => Promise.resolve(new Uint8Array(data))
    };
  }

  function createErrorResponse(status: number, statusText: string): Response {
    return {
      ok: false,
      status,
      statusText,
      headers: new Headers(),
      redirected: false,
      type: 'basic',
      url: '',
      clone: () => createErrorResponse(status, statusText),
      body: null,
      bodyUsed: false,
      json: () => Promise.reject(new Error('Error response')),
      arrayBuffer: () => Promise.reject(new Error('Error response')),
      blob: () => Promise.reject(new Error('Error response')),
      formData: () => Promise.reject(new Error('Error response')),
      text: () => Promise.resolve(''),
      bytes: () => Promise.resolve(new Uint8Array())
    };
  }
});
