/*!
 * Copyright 2021 Cognite AS
 */

import nock from 'nock';

import { CdfModelMetadataProvider } from './CdfModelMetadataProvider';
import { CogniteClient } from '@cognite/sdk';
import { File3dFormat } from './types';

describe('CdfModelMetadataProvider', () => {
  const appId = 'reveal-CdfModelDataClient-test';
  const baseUrl = 'http://localhost';
  const client = new CogniteClient({
    appId,
    baseUrl
  });
  client.loginWithApiKey({ apiKey: 'dummy', project: 'unittest' });
  const clientExt = new CdfModelMetadataProvider(client);
  const apiPath: RegExp = /\/api\/v1\/projects\/unittest\/3d\/.*/;

  test('getOutputs() throws error when server returns 400', async () => {
    const scope = nock(/.*/).get(apiPath).reply(400, {});

    await expect(clientExt.getOutputs({ modelId: 1337, revisionId: 42 })).rejects.toThrowError();
    expect(scope.isDone()).toBeTrue();
  });

  test('getOutputs() with empty outputs in response, returns empty list', async () => {
    // Arrange
    const response = {
      items: []
    };
    nock(/.*/).get(apiPath).reply(200, response);

    // Act
    const result = await clientExt.getOutputs({ modelId: 1337, revisionId: 42 });

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
    const result = await clientExt.getOutputs({ modelId: 1337, revisionId: 42 });

    // Assert
    expect(result).toEqual({ modelId: 1337, revisionId: 42, outputs: response.items });
  });

  test('getModelUrl throw error if no compatible output is found', async () => {
    // Arrange
    const response = {
      items: [
        {
          format: 'unsupported-format',
          version: 1,
          blobId: 1
        }
      ]
    };
    nock(/.*/).post(apiPath).reply(200, response);

    // Act & Assert
    expect(
      clientExt.getModelUrl({ modelId: 1337, revisionId: 42, format: File3dFormat.RevealCadModel })
    ).rejects.toThrowError();
  });
});
