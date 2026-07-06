/*!
 * Copyright 2021 Cognite AS
 */

import { vi } from 'vitest';
import { LocalModelDataProvider } from './LocalModelDataProvider';

describe(LocalModelDataProvider.name, () => {
  const provider = new LocalModelDataProvider();

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('getBinaryFile() with signed URL fetches directly and returns ArrayBuffer', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<() => Promise<Response>>().mockResolvedValue(new Response('binary-data', { status: 200 }))
    );
    const result = await provider.getBinaryFile('', 'https://cdn.example.com/sector.glb');
    expect(fetch).toHaveBeenCalledWith('https://cdn.example.com/sector.glb');
    expect(result).toBeInstanceOf(ArrayBuffer);
  });

  test('getJsonFile() with signed URL fetches directly and returns parsed JSON', async () => {
    const data = { version: 9 };
    vi.stubGlobal(
      'fetch',
      vi.fn<() => Promise<Response>>().mockResolvedValueOnce(new Response(JSON.stringify(data), { status: 200 }))
    );
    const result = await provider.getJsonFile('', 'https://cdn.example.com/scene.json');
    expect(fetch).toHaveBeenCalledWith('https://cdn.example.com/scene.json');
    expect(result).toEqual(data);
  });
});
