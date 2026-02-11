/*!
 * Copyright 2025 Cognite AS
 */

import { jest } from '@jest/globals';
import { CogniteClient } from '@cognite/sdk';
import { Mock } from 'moq.ts';
import {
  Cdf360ImageFileProvider,
  getFileIdentifiers,
  createFacesFromDescriptorsAndDownloads
} from './Cdf360ImageFileProvider';
import { Image360FileDescriptor } from '../types';
import { FileDownloadResult } from './CdfImageFileProvider';

describe(Cdf360ImageFileProvider.name, () => {
  describe(getFileIdentifiers.name, () => {
    test('extracts internal id from descriptor with fileId', () => {
      const descriptors: Image360FileDescriptor[] = [
        { fileId: 123, face: 'front', mimeType: 'image/jpeg' },
        { fileId: 456, face: 'back', mimeType: 'image/jpeg' }
      ];

      const identifiers = getFileIdentifiers(descriptors);

      expect(identifiers).toHaveLength(2);
      expect(identifiers[0]).toEqual({ id: 123 });
      expect(identifiers[1]).toEqual({ id: 456 });
    });

    test('extracts externalId from descriptor with externalId', () => {
      const descriptors: Image360FileDescriptor[] = [
        { externalId: 'file-1', face: 'front', mimeType: 'image/jpeg' },
        { externalId: 'file-2', face: 'back', mimeType: 'image/png' }
      ];

      const identifiers = getFileIdentifiers(descriptors);

      expect(identifiers).toHaveLength(2);
      expect(identifiers[0]).toEqual({ externalId: 'file-1' });
      expect(identifiers[1]).toEqual({ externalId: 'file-2' });
    });

    test('extracts instanceId from descriptor with instanceId', () => {
      const descriptors: Image360FileDescriptor[] = [
        {
          instanceId: { space: 'my-space', externalId: 'instance-1' },
          face: 'front',
          mimeType: 'image/jpeg'
        },
        {
          instanceId: { space: 'my-space', externalId: 'instance-2' },
          face: 'back',
          mimeType: 'image/jpeg'
        }
      ];

      const identifiers = getFileIdentifiers(descriptors);

      expect(identifiers).toHaveLength(2);
      expect(identifiers[0]).toEqual({
        instanceId: { space: 'my-space', externalId: 'instance-1' }
      });
      expect(identifiers[1]).toEqual({
        instanceId: { space: 'my-space', externalId: 'instance-2' }
      });
    });

    test('handles mixed identifier types', () => {
      const descriptors: Image360FileDescriptor[] = [
        { fileId: 123, face: 'front', mimeType: 'image/jpeg' },
        { externalId: 'file-ext', face: 'back', mimeType: 'image/jpeg' },
        {
          instanceId: { space: 's', externalId: 'e' },
          face: 'left',
          mimeType: 'image/jpeg'
        }
      ];

      const identifiers = getFileIdentifiers(descriptors);

      expect(identifiers).toHaveLength(3);
      expect(identifiers[0]).toEqual({ id: 123 });
      expect(identifiers[1]).toEqual({ externalId: 'file-ext' });
      expect(identifiers[2]).toEqual({
        instanceId: { space: 's', externalId: 'e' }
      });
    });

    test('throws error for descriptor without any identifier', () => {
      const descriptors: Image360FileDescriptor[] = [{ face: 'front', mimeType: 'image/jpeg' }];

      expect(() => getFileIdentifiers(descriptors)).toThrow(
        'Invalid Image360FileDescriptor: must have fileId, externalId, or instanceId'
      );
    });

    test('handles empty array', () => {
      const descriptors: Image360FileDescriptor[] = [];
      const identifiers = getFileIdentifiers(descriptors);
      expect(identifiers).toHaveLength(0);
    });

    test('handles all six faces with same identifier type', () => {
      const faces: Image360FileDescriptor['face'][] = ['front', 'back', 'left', 'right', 'top', 'bottom'];

      const descriptors: Image360FileDescriptor[] = faces.map((face, idx) => ({
        externalId: `file-${idx}`,
        face,
        mimeType: 'image/jpeg'
      }));

      const identifiers = getFileIdentifiers(descriptors);

      expect(identifiers).toHaveLength(6);
      identifiers.forEach((id, idx) => {
        expect(id).toEqual({ externalId: `file-${idx}` });
      });
    });
  });

  describe(createFacesFromDescriptorsAndDownloads.name, () => {
    test('creates Image360Face objects with mimeType from download result', () => {
      const descriptors: Image360FileDescriptor[] = [
        { fileId: 1, face: 'front', mimeType: 'image/jpeg' },
        { fileId: 2, face: 'back', mimeType: 'image/png' }
      ];

      const downloads: FileDownloadResult[] = [
        { data: new ArrayBuffer(100), mimeType: 'image/png' },
        { data: new ArrayBuffer(200), mimeType: 'image/jpeg' }
      ];

      const faces = createFacesFromDescriptorsAndDownloads(descriptors, downloads);

      expect(faces).toHaveLength(2);
      expect(faces[0].face).toBe('front');
      expect(faces[0].mimeType).toBe('image/png');
      expect(faces[0].data.byteLength).toBe(100);
      expect(faces[1].face).toBe('back');
      expect(faces[1].mimeType).toBe('image/jpeg');
      expect(faces[1].data.byteLength).toBe(200);
    });

    test('handles all six faces', () => {
      const faces: Image360FileDescriptor['face'][] = ['front', 'back', 'left', 'right', 'top', 'bottom'];

      const descriptors: Image360FileDescriptor[] = faces.map(face => ({
        fileId: 1,
        face,
        mimeType: 'image/jpeg'
      }));

      const downloads: FileDownloadResult[] = faces.map((_, idx) => ({
        data: new ArrayBuffer(idx * 10),
        mimeType: 'image/jpeg'
      }));

      const result = createFacesFromDescriptorsAndDownloads(descriptors, downloads);

      expect(result).toHaveLength(6);
      faces.forEach((face, idx) => {
        expect(result[idx].face).toBe(face);
      });
    });

    test('handles empty arrays', () => {
      const result = createFacesFromDescriptorsAndDownloads([], []);
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
          .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(1000), 'image/jpeg'))
          .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(2000), 'image/png'));

        const faces = await provider.get360ImageFiles(descriptors);

        expect(faces).toHaveLength(2);
        expect(faces[0].face).toBe('front');
        expect(faces[0].mimeType).toBe('image/jpeg');
        expect(faces[1].face).toBe('back');
        expect(faces[1].mimeType).toBe('image/png');
      });

      test('works with externalId descriptors', async () => {
        const descriptors: Image360FileDescriptor[] = [
          { externalId: 'file-ext-1', face: 'front', mimeType: 'image/jpeg' }
        ];

        fetchSpy
          .mockResolvedValueOnce(
            createJsonResponse({
              items: [{ externalId: 'file-ext-1', downloadUrl: 'https://storage.example.com/file1.jpg' }]
            })
          )
          .mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(100), 'image/jpeg'));

        const faces = await provider.get360ImageFiles(descriptors);

        expect(faces).toHaveLength(1);
        expect(faces[0].face).toBe('front');
      });
    });

    describe('getLowResolution360ImageFiles', () => {
      test('fetches icon images and returns Image360Face array', async () => {
        const descriptors: Image360FileDescriptor[] = [{ fileId: 123, face: 'front', mimeType: 'image/jpeg' }];

        fetchSpy.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(50), 'image/jpeg'));

        const faces = await provider.getLowResolution360ImageFiles(descriptors);

        expect(faces).toHaveLength(1);
        expect(faces[0].face).toBe('front');
        expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/files/icon?id=123'), expect.any(Object));
      });

      test('resolves externalId via files.retrieve before fetching icons', async () => {
        const descriptors: Image360FileDescriptor[] = [
          { externalId: 'file-ext', face: 'front', mimeType: 'image/jpeg' }
        ];

        // Create a new mock client with files.retrieve
        const mockClientWithFiles = new Mock<CogniteClient>()
          .setup(c => c.getBaseUrl())
          .returns('https://example.com')
          .setup(c => c.project)
          .returns('test-project')
          .setup(c => c.getDefaultRequestHeaders())
          .returns({ Authorization: 'Bearer token' })
          .setup(c => c.files.retrieve)
          .returns(() =>
            Promise.resolve([
              {
                id: 789,
                uploaded: true,
                name: 'test',
                lastUpdatedTime: new Date('2025-01-01'),
                createdTime: new Date('2025-01-01')
              }
            ])
          )
          .object();

        const providerWithFiles = new Cdf360ImageFileProvider(mockClientWithFiles);

        fetchSpy.mockResolvedValueOnce(createBinaryResponse(new ArrayBuffer(50), 'image/jpeg'));

        const faces = await providerWithFiles.getLowResolution360ImageFiles(descriptors);

        expect(faces).toHaveLength(1);
        expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/files/icon?id=789'), expect.any(Object));
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
});
