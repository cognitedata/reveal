/*!
 * Copyright 2021 Cognite AS
 */

import nock from 'nock';

import { CdfModelOutputsProvider } from './CdfModelOutputsProvider';

import { CogniteClient } from '@cognite/sdk';
import { CdfModelIdentifier } from './CdfModelIdentifier';
import { File3dFormat } from './types';

describe('CdfModelOutputsProvider', () => {
  let modelIdentifier: CdfModelIdentifier;
  let provider: CdfModelOutputsProvider;
  let apiPath: RegExp;

  beforeEach(async () => {
    modelIdentifier = new CdfModelIdentifier(1337, 42);
    apiPath = /\/api\/v1\/projects\/unittest\/3d\/.*/;

    const client = new CogniteClient({
      appId: 'reveal-CdfModelDataClient-test',
      baseUrl: 'https://localhost',
      project: 'unittest',
      getToken: async () => 'dummy'
    });

    provider = new CdfModelOutputsProvider(client);
  });

  test('getOutputs() throws error when server returns 400', async () => {
    const scope = nock(/.*/).get(apiPath).reply(400, {});

    await expect(provider.getOutputs(modelIdentifier, File3dFormat.AnyFormat)).rejects.toThrowError();
    expect(scope.isDone()).toBeTrue();
  });

  test('getOutputs() with empty outputs in response, returns empty list', async () => {
    // Arrange
    const response = {
      items: []
    };
    nock(/.*/).get(apiPath).reply(200, response);

    // Act
    const result = await provider.getOutputs(modelIdentifier, File3dFormat.AnyFormat);

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
    const result = await provider.getOutputs(modelIdentifier, File3dFormat.AnyFormat);

    // Assert
    expect(result).toEqual({ modelId: 1337, revisionId: 42, outputs: response.items });
  });
});
