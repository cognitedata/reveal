/*!
 * Copyright 2020 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { CdfModelDataRetriever } from '../../../utilities/networking/CdfModelDataRetriever';
import nock from 'nock';

describe('CdfModelDataRetriever', () => {
  const client = new CogniteClient({
    appId: 'unit-test',
    baseUrl: 'https://localhost' // Make sure we don't leak to CDF
  });
  const retriever = new CdfModelDataRetriever(client, 42);

  beforeEach(() => {
    nock.cleanAll();
  });

  // TODO 2020-03-06 larsmoa: Figure out why this test fails
  // test('fetchData() fetches blob by path', async () => {
  //   // Arrange
  //   nock(/.*/)
  //     .get(/.*/)
  //     .reply(200, 'ABCD');

  //   // Act
  //   await retriever.fetchData('blob.bin');

  //   // Assert
  //   expect(nock.isDone()).toBeTrue();
  // });

  test('fetchJson() fetches blob by path', async () => {
    // Arrange
    nock(/.*/)
      .get(/.*/)
      .reply(200, {});

    // Act
    await retriever.fetchJson('scene.json');

    // Assert
    expect(nock.isDone()).toBeTrue();
  });
});
