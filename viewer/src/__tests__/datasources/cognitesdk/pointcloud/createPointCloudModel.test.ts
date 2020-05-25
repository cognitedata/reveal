/*!
 * Copyright 2020 Cognite AS
 */

import nock from 'nock';
import { CogniteClient } from '@cognite/sdk';
import { createPointCloudModel } from '@/dataModels/point-cloud/public/createPointCloudModel';

describe('createPointCloudModel', () => {
  const appId = 'reveal-creatPointCloudModel-test';
  const baseUrl = 'https://localhost';
  const client = new CogniteClient({
    appId,
    baseUrl
  });

  test('invalid modelId, throws', async () => {
    // Arrange
    nock(/.*/)
      .post(/.*/)
      .reply(404);

    // Act
    expect(createPointCloudModel(client, { id: 1337 })).rejects.toThrowError();
  });

  test('valid modelId without point cloud output, throws', async () => {
    // Arrange
    nock(/.*/)
      .post(/.*/)
      .reply(200, []);

    // Act
    expect(createPointCloudModel(client, { id: 1337 })).rejects.toThrowError();
  });

  test('valid modelId point cloud output, returns model', async () => {
    // Arrange
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
      .post(/.*/)
      .reply(200, response);

    // Act
    const model = await createPointCloudModel(client, { id: 1337 });
    expect(model).toBeTruthy();
  });
});
