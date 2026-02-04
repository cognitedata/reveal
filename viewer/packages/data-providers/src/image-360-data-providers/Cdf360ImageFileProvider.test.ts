/*!
 * Copyright 2025 Cognite AS
 */

import { jest } from '@jest/globals';
import { CogniteClient } from '@cognite/sdk';
import { Mock } from 'moq.ts';
import { Cdf360ImageFileProvider, getFileIds, createFacesFromDescriptorsAndBuffers } from './Cdf360ImageFileProvider';
import { Image360FileDescriptor } from '../types';

describe(Cdf360ImageFileProvider.name, () => {
  describe(getFileIds.name, () => {
    test('extracts file IDs from descriptors', () => {
      const descriptors: Image360FileDescriptor[] = [
        { fileId: 123, face: 'front', mimeType: 'image/jpeg' },
        { fileId: 456, face: 'back', mimeType: 'image/jpeg' }
      ];

      const fileIds = getFileIds(descriptors);

      expect(fileIds).toHaveLength(2);
      expect(fileIds[0]).toEqual({ id: 123 });
      expect(fileIds[1]).toEqual({ id: 456 });
    });

    test('handles all six faces', () => {
      const faces: Image360FileDescriptor['face'][] = ['front', 'back', 'left', 'right', 'top', 'bottom'];

      const descriptors: Image360FileDescriptor[] = faces.map((face, idx) => ({
        fileId: idx + 1,
        face,
        mimeType: 'image/jpeg'
      }));

      const fileIds = getFileIds(descriptors);

      expect(fileIds).toHaveLength(6);
      fileIds.forEach((fileId, idx) => {
        expect(fileId).toEqual({ id: idx + 1 });
      });
    });

    test('handles empty array', () => {
      const fileIds = getFileIds([]);
      expect(fileIds).toHaveLength(0);
    });
  });

  describe(createFacesFromDescriptorsAndBuffers.name, () => {
    test('creates Image360Face objects from descriptors and buffers', () => {
      const descriptors: Image360FileDescriptor[] = [
        { fileId: 1, face: 'front', mimeType: 'image/jpeg' },
        { fileId: 2, face: 'back', mimeType: 'image/png' }
      ];

      const buffers: ArrayBuffer[] = [new ArrayBuffer(100), new ArrayBuffer(200)];

      const faces = createFacesFromDescriptorsAndBuffers(descriptors, buffers);

      expect(faces).toHaveLength(2);
      expect(faces[0].face).toBe('front');
      expect(faces[0].mimeType).toBe('image/jpeg');
      expect(faces[0].data.byteLength).toBe(100);
      expect(faces[1].face).toBe('back');
      expect(faces[1].mimeType).toBe('image/png');
      expect(faces[1].data.byteLength).toBe(200);
    });

    test('handles all six faces', () => {
      const faces: Image360FileDescriptor['face'][] = ['front', 'back', 'left', 'right', 'top', 'bottom'];

      const descriptors: Image360FileDescriptor[] = faces.map((face, idx) => ({
        fileId: idx + 1,
        face,
        mimeType: 'image/jpeg'
      }));

      const buffers: ArrayBuffer[] = faces.map((_, idx) => new ArrayBuffer(idx * 10));

      const result = createFacesFromDescriptorsAndBuffers(descriptors, buffers);

      expect(result).toHaveLength(6);
      faces.forEach((face, idx) => {
        expect(result[idx].face).toBe(face);
        expect(result[idx].mimeType).toBe('image/jpeg');
      });
    });

    test('handles empty arrays', () => {
      const result = createFacesFromDescriptorsAndBuffers([], []);
      expect(result).toHaveLength(0);
    });
  });

  describe(Cdf360ImageFileProvider.name + ' class', () => {
    let mockClient: CogniteClient;
    let provider: Cdf360ImageFileProvider;
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

      provider = new Cdf360ImageFileProvider(mockClient);
    });

    afterEach(() => {
      fetchSpy.mockRestore();
    });

    describe('get360ImageFiles', () => {
      test('fetches full resolution images and returns Image360Face array', async () => {
        const descriptors: Image360FileDescriptor[] = [
          { fileId: 123, face: 'front', mimeType: 'image/jpeg' },
          { fileId: 456, face: 'back', mimeType: 'image/png' }
        ];

        fetchSpy
          .mockResolvedValueOnce(
            createJsonResponse({
              items: [
                { id: 123, downloadUrl: 'https://storage.example.com/file1.jpg' },
                { id: 456, downloadUrl: 'https://storage.example.com/file2.png' }
              ]
            })
          )
          .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(1000)))
          .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(2000)));

        const faces = await provider.get360ImageFiles(descriptors);

        expect(faces).toHaveLength(2);
        expect(faces[0].face).toBe('front');
        expect(faces[0].mimeType).toBe('image/jpeg');
        expect(faces[0].data.byteLength).toBe(1000);
        expect(faces[1].face).toBe('back');
        expect(faces[1].mimeType).toBe('image/png');
        expect(faces[1].data.byteLength).toBe(2000);
      });
    });

    describe('getLowResolution360ImageFiles', () => {
      test('fetches icon images and returns Image360Face array', async () => {
        const descriptors: Image360FileDescriptor[] = [{ fileId: 123, face: 'front', mimeType: 'image/jpeg' }];

        fetchSpy.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(50)));

        const faces = await provider.getLowResolution360ImageFiles(descriptors);

        expect(faces).toHaveLength(1);
        expect(faces[0].face).toBe('front');
        expect(faces[0].mimeType).toBe('image/jpeg');
        expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/files/icon?id=123'), expect.any(Object));
      });
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
});
