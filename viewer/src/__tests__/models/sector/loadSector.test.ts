/*!
 * Copyright 2019 Cognite AS
 */

import { FetchSectorDelegate, ParseSectorDelegate, ConsumeSectorDelegate } from '../../../models/sector/delegates';
import { loadSector } from '../../../models/sector/loadSector';
import { waitUntill } from '../../wait';
import { LoadSectorStatus, LoadSectorRequest, Sector } from '../../../models/sector/types';
import { createEmptySector } from './emptySector';

describe('loadSector', () => {
  const fetch: FetchSectorDelegate = jest.fn();
  const parse: ParseSectorDelegate<Sector> = jest.fn();
  const consume: ConsumeSectorDelegate<Sector> = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successful processing', async () => {
    const request = loadSector(0, fetch, parse, consume);
    await request.promise;

    expect(fetch).toBeCalled();
    expect(parse).toBeCalled();
    expect(consume).toBeCalled();
    expect(request.status()).toBe(LoadSectorStatus.Resolved);
  });

  test('immediatly cancelled', async () => {
    const request = loadSector(0, fetch, parse, consume);
    request.cancel();
    await request.promise;

    // Note! fetch will probably be called because processing
    // starts immediatly
    expect(parse).not.toBeCalled();
    expect(consume).not.toBeCalled();
    expect(request.status()).toBe(LoadSectorStatus.Cancelled);
  });

  test('cancelled after fetch', async () => {
    let request: LoadSectorRequest | undefined;
    const myFetch: FetchSectorDelegate = jest.fn(async () => {
      await waitUntill(() => request !== undefined);
      request!.cancel();
      return new Uint8Array(0);
    });
    request = loadSector(0, myFetch, parse, consume);
    await request.promise;

    expect(myFetch).toBeCalled();
    expect(parse).not.toBeCalled();
    expect(consume).not.toBeCalled();
    expect(request.status()).toBe(LoadSectorStatus.Cancelled);
  });

  test('cancelled after parse', async () => {
    let request: LoadSectorRequest | undefined;
    const myParse: ParseSectorDelegate<Sector> = jest.fn(
      async (): Promise<Sector> => {
        await waitUntill(() => request !== undefined);
        request!.cancel();
        return createEmptySector();
      }
    );
    request = loadSector(0, fetch, myParse, consume);
    await request.promise;

    expect(fetch).toBeCalled();
    expect(myParse).toBeCalled();
    expect(consume).not.toBeCalled();
    expect(request.status()).toBe(LoadSectorStatus.Cancelled);
  });
});
