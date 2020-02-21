/*!
 * Copyright 2020 Cognite AS
 */

import nock from 'nock';
import { CogniteClient } from '@cognite/sdk';
import { createPointCloudModel } from '../../../../datasources/cognitesdk';

describe('createPointCloudModel', () => {
  const appId = 'reveal-creatPointCloudModel-test';
  const baseUrl = 'https://localhost';

  test('invalid modelId, throws', async () => {
    // Arrange
    const sdk = new CogniteClient({
      appId,
      baseUrl
    });
    nock(/.*/)
      .get(/.*/)
      .reply(404);

    // Act
    expect(createPointCloudModel(sdk, 1337)).rejects.toThrowError();
  });

  test('valid modelId without point cloud output, throws', async () => {
    // Arrange
    const sdk = new CogniteClient({
      appId,
      baseUrl
    });
    nock(/.*/)
      .get(/.*/)
      .reply(200, []);

    // Act
    expect(createPointCloudModel(sdk, 1337)).rejects.toThrowError();
  });

  test('valid modelId point cloud output, returns model', async () => {
    // Arrange
    const sdk = new CogniteClient({
      appId,
      baseUrl
    });
    const response = {
      items: [
        {
          model: { id: 1337 },
          outputs: [
            {
              format: 'ept-pointcloud',
              version: 1,
              blobId: 4242424242
            }
          ]
        }
      ]
    };
    nock(/.*/)
      .get(/.*/)
      .reply(200, response);

    // Act
    const model = await createPointCloudModel(sdk, 1337);
    expect(model).toBeTruthy();
  });
});
