/*!
 * Copyright 2021 Cognite AS
 */

import { vi } from 'vitest';
import { LocalModelDataProvider } from './LocalModelDataProvider';
import { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';

describe(LocalModelDataProvider.name, () => {
  const provider = new LocalModelDataProvider();
  const baseUrl = 'http://localhost/model';
  const dmIdentifier = new DMModelIdentifier({
    modelId: 1,
    revisionId: 2,
    revisionExternalId: 'ext-id',
    revisionSpace: 'my-space'
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('getBinaryFile() with signed URL fetches directly and returns ArrayBuffer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<() => Promise<Response>>().mockResolvedValue(new Response('binary-data', { status: 200 }))
    );
    const result = await provider.getBinaryFile('https://cdn.example.com/sector.glb');
    expect(fetch).toHaveBeenCalledWith('https://cdn.example.com/sector.glb');
    expect(result).toBeInstanceOf(ArrayBuffer);
  });

  test('getJsonFile() with signed URL fetches directly and returns parsed JSON', async () => {
    const data = { version: 9 };
    vi.stubGlobal(
      'fetch',
      vi.fn<() => Promise<Response>>().mockResolvedValueOnce(new Response(JSON.stringify(data), { status: 200 }))
    );
    const result = await provider.getJsonFile('https://cdn.example.com/scene.json');
    expect(fetch).toHaveBeenCalledWith('https://cdn.example.com/scene.json');
    expect(result).toEqual(data);
  });

  test('getDMSJsonFile() constructs URL from baseUrl and fileName and returns bundle', async () => {
    const data = { sectors: [] };
    vi.stubGlobal(
      'fetch',
      vi.fn<() => Promise<Response>>().mockResolvedValueOnce(new Response(JSON.stringify(data), { status: 200 }))
    );
    const result = await provider.getDMSJsonFile(baseUrl, dmIdentifier, 'scene.json');
    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/scene.json`);
    expect(result).toEqual({ signedFiles: { items: [] }, fileData: data });
  });
});
