/*!
 * Copyright 2021 Cognite AS
 */

import nock from 'nock';
import { CdfModelDataClient } from './CdfModelDataClient';

import { CogniteClient } from '@cognite/sdk';

describe('CdfModelDataClient', () => {
  const appId = 'reveal-CdfModelDataClient-test';
  const baseUrl = 'http://localhost';
  const client = new CogniteClient({
    appId,
    baseUrl
  });
  client.loginWithApiKey({ apiKey: 'dummy', project: 'unittest' });
  const clientExt = new CdfModelDataClient(client);

  test('getBinaryFile() with binary data returns valid ArrayBuffer', async () => {
    // Arrange
    const response = '0123456789';
    nock(/.*/).get(/.*/).reply(200, response, { 'content-type': 'binary' });

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
});
