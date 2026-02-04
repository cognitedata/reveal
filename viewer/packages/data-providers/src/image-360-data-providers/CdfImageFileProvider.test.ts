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

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('getFileBuffers', () => {
    test('fetches files using internal IDs and returns ArrayBuffers', async () => {
      const fileIds = [{ id: 123 }, { id: 456 }];

      fetchSpy
        .mockResolvedValueOnce(
          createJsonResponse({
            items: [
              { id: 123, downloadUrl: 'https://storage.example.com/file1.jpg' },
              { id: 456, downloadUrl: 'https://storage.example.com/file2.jpg' }
            ]
          })
        )
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(100)))
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(200)));

      const results = await provider.getFileBuffers(fileIds);

      expect(results).toHaveLength(2);
      expect(results[0]).toBeInstanceOf(ArrayBuffer);
      expect(results[0].byteLength).toBe(100);
      expect(results[1]).toBeInstanceOf(ArrayBuffer);
      expect(results[1].byteLength).toBe(200);
    });

    test('throws error when file download fails', async () => {
      const fileIds = [{ id: 123 }];

      fetchSpy
        .mockResolvedValueOnce(
          createJsonResponse({
            items: [{ id: 123, downloadUrl: 'https://storage.example.com/file1.jpg' }]
          })
        )
        .mockResolvedValueOnce(createErrorResponse(404, 'Not Found'));

      await expect(provider.getFileBuffers(fileIds)).rejects.toThrow('Failed to fetch file: 404 Not Found');
    });

    test('throws error when downloadlink request fails', async () => {
      const fileIds = [{ id: 123 }];

      fetchSpy.mockResolvedValueOnce(createErrorResponse(400, 'Bad Request'));

      await expect(provider.getFileBuffers(fileIds)).rejects.toThrow('Failed to get download URLs: 400 Bad Request');
    });

    test('handles empty file IDs array', async () => {
      fetchSpy.mockResolvedValueOnce(createJsonResponse({ items: [] }));

      const results = await provider.getFileBuffers([]);

      expect(results).toHaveLength(0);
    });
  });

  describe('getIconBuffers', () => {
    test('fetches icons using internal IDs and returns ArrayBuffers', async () => {
      const fileIds = [{ id: 123 }, { id: 456 }];

      fetchSpy
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(50)))
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(60)));

      const results = await provider.getIconBuffers(fileIds);

      expect(results).toHaveLength(2);
      expect(results[0]).toBeInstanceOf(ArrayBuffer);
      expect(results[0].byteLength).toBe(50);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/files/icon?id=123'), expect.any(Object));
      expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/files/icon?id=456'), expect.any(Object));
    });

    test('throws error when icon fetch fails', async () => {
      const fileIds = [{ id: 123 }];

      fetchSpy.mockResolvedValueOnce(createErrorResponse(500, 'Internal Server Error'));

      await expect(provider.getIconBuffers(fileIds)).rejects.toThrow('Failed to fetch icon: 500 Internal Server Error');
    });

    test('handles empty file IDs array', async () => {
      const results = await provider.getIconBuffers([]);

      expect(results).toHaveLength(0);
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('getDownloadUrls (via getFileBuffers)', () => {
    test('sends correct POST request to downloadlink endpoint', async () => {
      const fileIds = [{ id: 123 }, { id: 456 }];

      fetchSpy
        .mockResolvedValueOnce(
          createJsonResponse({
            items: [
              { id: 123, downloadUrl: 'https://storage.example.com/file1.jpg' },
              { id: 456, downloadUrl: 'https://storage.example.com/file2.jpg' }
            ]
          })
        )
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(100)))
        .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(200)));

      await provider.getFileBuffers(fileIds);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/files/downloadlink'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ items: [{ id: 123 }, { id: 456 }] })
        })
      );
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

  function createBinaryResponse(data: ArrayBuffer, ok = true, status = 200, statusText = 'OK'): Response {
    return {
      ok,
      status,
      statusText,
      headers: new Headers(),
      arrayBuffer: () => Promise.resolve(data),
      redirected: false,
      type: 'basic',
      url: '',
      clone: () => createBinaryResponse(data, ok, status, statusText),
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
