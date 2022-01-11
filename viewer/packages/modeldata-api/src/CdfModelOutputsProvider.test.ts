/*!
 * Copyright 2021 Cognite AS
 */

import nock from 'nock';

import { File3dFormat } from './types';
import { CdfModelOutputsProvider } from './CdfModelOutputsProvider';

import { CogniteClient } from '@cognite/sdk';
import { CdfModelIdentifier } from './CdfModelIdentifier';

describe('CdfModelOutputsProvider', () => {
  let modelIdentifier: CdfModelIdentifier;
  let provider: CdfModelOutputsProvider;
  let apiPath: RegExp;

  beforeEach(async () => {
    modelIdentifier = new CdfModelIdentifier(1337, 42, File3dFormat.AnyFormat);
    apiPath = /\/api\/v1\/projects\/unittest\/3d\/.*/;

    const client = new CogniteClient({
      appId: 'reveal-CdfModelDataClient-test',
      baseUrl: 'http://localhost'
    });
    await client.loginWithApiKey({ apiKey: 'dummy', project: 'unittest' });

    provider = new CdfModelOutputsProvider(client);
  });

  test('getOutputs() throws error when server returns 400', async () => {
    const scope = nock(/.*/).get(apiPath).reply(400, {});

    await expect(provider.getOutputs(modelIdentifier)).rejects.toThrowError();
    expect(scope.isDone()).toBeTrue();
  });

  test('getOutputs() with empty outputs in response, returns empty list', async () => {
    // Arrange
    const response = {
      items: []
    };
    nock(/.*/).get(apiPath).reply(200, response);

    // Act
    const result = await provider.getOutputs(modelIdentifier);

    // Assert
    expect(result).toEqual({ modelId: 1337, revisionId: 42, outputs: [] });
  });

  test('getOutputs() with two outputs, returns both outputs', async () => {
    // Arrange
    const response = {
      items: [
        {
          format: 'ept-pointcloud',
          version: 1,
          blobId: 1
        },
        {
          format: 'ept-pointcloud',
          version: 2,
          blobId: 2
        }
      ]
    };
    nock(/.*/).get(apiPath).reply(200, response);

    // Act
    const result = await provider.getOutputs(modelIdentifier);

    // Assert
    expect(result).toEqual({ modelId: 1337, revisionId: 42, outputs: response.items });
  });
});
