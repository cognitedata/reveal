/*!
 * Copyright 2021 Cognite AS
 */

import { vi } from 'vitest';
import { gzipSync } from 'node:zlib';
import { CdfModelDataProvider } from './CdfModelDataProvider';

import { CogniteClient } from '@cognite/sdk';

import { mockClientAuthentication } from '../../../../test-utilities/src/cogniteClientAuth';
import { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';

describe(CdfModelDataProvider.name, () => {
  const appId = 'reveal-CdfModelDataClient-test';
  const baseUrl = 'http://localhost';
  const client = new CogniteClient({
    appId,
    project: 'dummy',
    getToken: async () => 'dummy'
  });

  let authenticationSpy = mockClientAuthentication(client);

  const clientExt = new CdfModelDataProvider(client);

  const dmIdentifier = new DMModelIdentifier({
    modelId: 1,
    revisionId: 2,
    revisionExternalId: 'ext-id',
    revisionSpace: 'my-space'
  });

  beforeEach(() => {
    authenticationSpy = mockClientAuthentication(client);
  });

  afterEach(() => {
    authenticationSpy.mockRestore();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('getBinaryFile() with binary data returns valid ArrayBuffer', async () => {
    // Arrange
    const response = '0123456789';
    vi.stubGlobal(
      'fetch',
      vi
        .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
        .mockResolvedValueOnce(new Response(response, { status: 200, headers: { 'content-type': 'binary' } }))
    );

    // Act
    const result = await clientExt.getBinaryFile(baseUrl, 'sector_5.i3d');

    // Assert
    const expected = new Array<number>(response.length);
    for (let i = 0; i < response.length; i++) {
      expected[i] = response.charCodeAt(i);
    }
    const view = new Uint8Array(result);
    expect(view.toString()).toEqual(expected.toString());
  });

  test('getBinaryFile() does not authenticate on 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
        .mockResolvedValueOnce(new Response('', { status: 200 }))
    );

    await clientExt.getBinaryFile(baseUrl, 'sector_5.i3d');
    expect(authenticationSpy).not.toHaveBeenCalled();
  });

  test('getBinaryFile() re-authenticates on 401', async () => {
    // Make first API call fail, second succeed
    vi.stubGlobal(
      'fetch',
      vi
        .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
        .mockResolvedValueOnce(new Response('', { status: 401 }))
        .mockResolvedValueOnce(new Response('', { status: 200 }))
    );

    expect(authenticationSpy).not.toHaveBeenCalled();
    await clientExt.getBinaryFile(baseUrl, 'sector_5.i3d');
    expect(authenticationSpy).toHaveBeenCalledTimes(1);
  });

  test('getJsonFile() returns raw response data', async () => {
    const mockData = { version: 9, sectors: [] };
    vi.spyOn(client, 'get').mockResolvedValueOnce({ data: mockData, headers: {}, status: 200 } as any);

    const result = await clientExt.getJsonFile(baseUrl, 'scene.json');

    expect(result).toBe(mockData);
  });

  test('getBinaryFile() with signed URL returns ArrayBuffer without auth headers', async () => {
    const response = '0123456789';
    const fetchMock = vi
      .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(new Response(response, { status: 200, headers: { 'content-type': 'binary' } }));
    vi.stubGlobal('fetch', fetchMock);
    const getHeadersSpy = vi.spyOn(client, 'getDefaultRequestHeaders');

    const result = await clientExt.getBinaryFile('', 'https://signed.url/file.glb');

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(getHeadersSpy).not.toHaveBeenCalled();
    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toBe('https://signed.url/file.glb');
    expect(requestInit!.headers).toEqual({ Accept: '*/*' });
  });

  test('getJsonFile() with signed URL parses JSON response without auth headers', async () => {
    const jsonData = { version: 9, sectors: [] };
    const fetchMock = vi
      .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(jsonData), { status: 200, headers: { 'content-type': 'application/json' } })
      );
    vi.stubGlobal('fetch', fetchMock);
    const getHeadersSpy = vi.spyOn(client, 'getDefaultRequestHeaders');

    const result = await clientExt.getJsonFile('', 'https://signed.url/scene.json');

    expect(result).toEqual(jsonData);
    expect(getHeadersSpy).not.toHaveBeenCalled();
    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toBe('https://signed.url/scene.json');
    expect(requestInit!.headers).toEqual({ Accept: 'application/json, */*' });
  });

  test('getJsonFile() with signed URL decompresses a gzip body missing the Content-Encoding header', async () => {
    const jsonData = { version: 9, sectors: [{ id: 1 }] };
    const gzipped = gzipSync(Buffer.from(JSON.stringify(jsonData)));
    const fetchMock = vi
      .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(new Response(gzipped, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await clientExt.getJsonFile('', 'https://signed.url/scene.json');

    expect(result).toEqual(jsonData);
  });

  test('getFileUrlsForModel() paginates through multiple cursor pages to collect all signedFiles', async () => {
    const page1Items = [{ signedUrl: 'https://signed/1.glb', fileName: '1.glb', subPath: '' }];
    const page2Items = [
      { signedUrl: 'https://signed/2.glb', fileName: '2.glb', subPath: '' },
      { signedUrl: 'https://signed/scene.json', fileName: 'scene.json', subPath: '' }
    ];

    const postSpy = vi
      .spyOn(client, 'post')
      .mockResolvedValueOnce({ data: { items: page1Items, nextCursor: 'cursor-abc' }, headers: {}, status: 200 } as any)
      .mockResolvedValueOnce({ data: { items: page2Items, nextCursor: undefined }, headers: {}, status: 200 } as any);

    const result = await clientExt.getFileUrlsForModel(baseUrl, dmIdentifier, 'scene.json');

    expect(postSpy).toHaveBeenCalledTimes(2);
    expect(result).toEqual([...page1Items, ...page2Items]);
    const secondCallData = (postSpy.mock.calls[1][1] as any).data;
    expect(secondCallData.cursor).toBe('cursor-abc');
  });

  test('getFileUrlsForModel() returns signed URL list for all model files', async () => {
    const mockFiles = {
      items: [{ signedUrl: 'https://s/scene.json', fileName: 'scene.json', subPath: '' }],
      nextCursor: undefined
    };

    vi.spyOn(client, 'post').mockResolvedValueOnce({ data: mockFiles, headers: {}, status: 200 } as any);

    const result = await clientExt.getFileUrlsForModel(baseUrl, dmIdentifier, 'scene.json');

    expect(result).toEqual(mockFiles.items);
  });
});
