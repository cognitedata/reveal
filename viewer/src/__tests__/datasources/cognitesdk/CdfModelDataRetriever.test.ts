/*!
 * Copyright 2020 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { CdfModelDataRetriever } from '../../../datasources/cognitesdk/CdfModelDataRetriever';
import nock from 'nock';

describe('CdfModelDataRetriever', () => {
  const client = new CogniteClient({
    appId: 'unit-test',
    baseUrl: 'https://localhost' // Make sure we don't leak to CDF
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  test('fetchJson() fetches blob by path', async () => {
    // Arrange
    nock(/.*/)
      .post(/.*/)
      .reply(200, {});

    const retriever = new CdfModelDataRetriever(client, 42);

    // Act
    await retriever.fetchJson('scene.json');

    // Assert
    expect(nock.isDone()).toBeTrue();
  });

  test('fetchData() fetches blob by path', async () => {
    // Arrange
    nock(/.*/)
      .post(/.*/)
      .reply(200, {});

    const retriever = new CdfModelDataRetriever(client, 42);

    // Act
    await retriever.fetchData('blob.bin');

    // Assert
    expect(nock.isDone()).toBeTrue();
  });
});
