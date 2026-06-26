/*!
 * Copyright 2021 Cognite AS
 */

import { vi } from 'vitest';
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

  test('getSignedBinaryFile() returns ArrayBuffer without auth headers', async () => {
    const response = '0123456789';
    const fetchMock = vi
      .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(new Response(response, { status: 200, headers: { 'content-type': 'binary' } }));
    vi.stubGlobal('fetch', fetchMock);
    const getHeadersSpy = vi.spyOn(client, 'getDefaultRequestHeaders');

    const result = await clientExt.getSignedBinaryFile('https://signed.url/file.glb');

    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(getHeadersSpy).not.toHaveBeenCalled();
    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toBe('https://signed.url/file.glb');
    expect(requestInit!.headers).toEqual({ Accept: '*/*' });
  });

  test('getSignedJsonFile() parses JSON response without auth headers', async () => {
    const jsonData = { version: 9, sectors: [] };
    const fetchMock = vi
      .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(jsonData), { status: 200, headers: { 'content-type': 'application/json' } })
      );
    vi.stubGlobal('fetch', fetchMock);
    const getHeadersSpy = vi.spyOn(client, 'getDefaultRequestHeaders');

    const result = await clientExt.getSignedJsonFile('https://signed.url/scene.json');

    expect(result).toEqual(jsonData);
    expect(getHeadersSpy).not.toHaveBeenCalled();
    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toBe('https://signed.url/scene.json');
    expect(requestInit!.headers).toEqual({ Accept: 'application/json, */*' });
  });

  test('fetchDMSJsonFile() paginates through multiple cursor pages', async () => {
    const page1Items = [{ signedUrl: 'https://signed/1.glb', fileName: '1.glb', subPath: '' }];
    const page2Items = [{ signedUrl: 'https://signed/2.glb', fileName: '2.glb', subPath: '' }];

    const postSpy = vi
      .spyOn(client, 'post')
      .mockResolvedValueOnce({ data: { items: page1Items, nextCursor: 'cursor-abc' }, headers: {}, status: 200 } as any)
      .mockResolvedValueOnce({ data: { items: page2Items, nextCursor: undefined }, headers: {}, status: 200 } as any);

    const result = await clientExt.fetchDMSJsonFile(baseUrl, dmIdentifier);

    expect(postSpy).toHaveBeenCalledTimes(2);
    expect(result.items).toEqual([...page1Items, ...page2Items]);
    const secondCallData = (postSpy.mock.calls[1][1] as any).data;
    expect(secondCallData.cursor).toBe('cursor-abc');
  });

  test('getDMSJsonFile() returns combined signedFiles and fileData', async () => {
    const mockFiles = {
      items: [{ signedUrl: 'https://s/0.glb', fileName: '0.glb', subPath: '' }],
      nextCursor: undefined
    };
    const mockData = { version: 9 };

    vi.spyOn(clientExt, 'fetchDMSJsonFile').mockResolvedValueOnce(mockFiles);
    vi.spyOn(clientExt, 'getDMSJsonFileFromFileName').mockResolvedValueOnce(mockData);

    const result = (await clientExt.getDMSJsonFile(baseUrl, dmIdentifier, 'scene.json')) as {
      signedFiles: typeof mockFiles;
      fileData: typeof mockData;
    };

    expect(result.signedFiles).toEqual(mockFiles);
    expect(result.fileData).toEqual(mockData);
  });
});
