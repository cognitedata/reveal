/*!
 * Copyright 2021 Cognite AS
 */

import { vi } from 'vitest';
import { LocalModelDataProvider } from './LocalModelDataProvider';
import { DMModelIdentifier } from '../model-identifiers/DMModelIdentifier';
import { Log } from '@reveal/logger';

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

  test('getSignedBinaryFile() fetches signedUrl directly, returns ArrayBuffer, warns on AbortSignal', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<() => Promise<Response>>().mockResolvedValue(new Response('binary-data', { status: 200 }))
    );
    const warnSpy = vi.spyOn(Log, 'warn');
    const result = await provider.getSignedBinaryFile(
      'https://cdn.example.com/sector.glb',
      new AbortController().signal
    );
    expect(fetch).toHaveBeenCalledWith('https://cdn.example.com/sector.glb');
    expect(result).toBeInstanceOf(ArrayBuffer);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('not supported'));
  });

  test('getSignedJsonFile() fetches signedUrl directly and returns parsed JSON', async () => {
    const data = { version: 9 };
    vi.stubGlobal(
      'fetch',
      vi.fn<() => Promise<Response>>().mockResolvedValueOnce(new Response(JSON.stringify(data), { status: 200 }))
    );
    const result = await provider.getSignedJsonFile('https://cdn.example.com/scene.json');
    expect(fetch).toHaveBeenCalledWith('https://cdn.example.com/scene.json');
    expect(result).toEqual(data);
  });

  test.each<[string, (p: LocalModelDataProvider, fileName: string) => Promise<unknown>]>([
    ['getDMSJsonFile', (p, f) => p.getDMSJsonFile(baseUrl, dmIdentifier, f)],
    ['getDMSJsonFileFromFileName', (p, f) => p.getDMSJsonFileFromFileName(baseUrl, dmIdentifier, f)]
  ])('%s() constructs URL from baseUrl and fileName, ignores modelIdentifier', async (_, callMethod) => {
    const data = { sectors: [] };
    vi.stubGlobal(
      'fetch',
      vi.fn<() => Promise<Response>>().mockResolvedValueOnce(new Response(JSON.stringify(data), { status: 200 }))
    );
    const result = await callMethod(provider, 'scene.json');
    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/scene.json`);
    expect(result).toEqual(data);
  });
});
