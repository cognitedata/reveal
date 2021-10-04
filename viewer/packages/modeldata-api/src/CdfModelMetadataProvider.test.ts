/*!
 * Copyright 2021 Cognite AS
 */

import nock from 'nock';

import { CogniteClient } from '@cognite/sdk';
import { File3dFormat } from './types';
import { CdfModelIdentifier } from './CdfModelIdentifier';
import { CdfModelMetadataProvider } from './CdfModelMetadataProvider';

describe(CdfModelMetadataProvider.name, () => {
  let modelIdentifier: CdfModelIdentifier;
  let provider: CdfModelMetadataProvider;
  let apiPath: RegExp;

  beforeEach(async () => {
    modelIdentifier = new CdfModelIdentifier(1337, 42, File3dFormat.AnyFormat);
    apiPath = /\/api\/v1\/projects\/unittest\/3d\/.*/;

    const client = new CogniteClient({
      appId: 'reveal-CdfModelDataClient-test',
      baseUrl: 'http://localhost'
    });
    await client.loginWithApiKey({ apiKey: 'dummy', project: 'unittest' });

    provider = new CdfModelMetadataProvider(client);
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
    expect(provider.getModelUrl(modelIdentifier)).rejects.toThrowError();
  });
});
