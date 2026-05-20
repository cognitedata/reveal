/*!
 * Copyright 2021 Cognite AS
 */

import { CdfModelDataProvider } from './CdfModelDataProvider';

import { CogniteClient } from '@cognite/sdk';

import { mockClientAuthentication } from '../../../../test-utilities/src/cogniteClientAuth';

import { jest } from '@jest/globals';

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

  beforeEach(() => {
    authenticationSpy = mockClientAuthentication(client);
  });

  afterEach(() => {
    authenticationSpy.mockRestore();
    jest.restoreAllMocks();
  });

  test('getBinaryFile() with binary data returns valid ArrayBuffer', async () => {
    // Arrange
    const response = '0123456789';
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(response, { status: 200 }));

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
    jest.spyOn(global, 'fetch').mockResolvedValueOnce(new Response('', { status: 200 }));

    await clientExt.getBinaryFile(baseUrl, 'sector_5.i3d');
    expect(authenticationSpy).not.toHaveBeenCalled();
  });

  test('getBinaryFile() re-authenticates on 401', async () => {
    // Make first API call fail, second succeed
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(new Response('', { status: 200 }));

    expect(authenticationSpy).not.toHaveBeenCalled();
    await clientExt.getBinaryFile(baseUrl, 'sector_5.i3d');
    expect(authenticationSpy).toHaveBeenCalledTimes(1);
  });
});
