/*!
 * Copyright 2021 Cognite AS
 */

import nock from 'nock';

import { CogniteClient } from '@cognite/sdk';
import { CdfModelIdentifier } from './CdfModelIdentifier';
import { CdfModelMetadataProvider } from './CdfModelMetadataProvider';
import { Mock } from 'moq.ts';

describe(CdfModelMetadataProvider.name, () => {
  let modelIdentifier: CdfModelIdentifier;
  let provider: CdfModelMetadataProvider;
  let apiPath: RegExp;

  beforeEach(async () => {
    modelIdentifier = new CdfModelIdentifier(1337, 42);
    apiPath = /\/api\/v1\/projects\/unittest\/3d\/.*/;

    const client = new Mock<CogniteClient>();

    provider = new CdfModelMetadataProvider(client.object());
  });

  test('getModelUri throw error if no compatible output is found', async () => {
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
    expect(provider.getModelUri(modelIdentifier, response.items[0])).rejects.toThrowError();
  });
});
