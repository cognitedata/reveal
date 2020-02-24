/*!
 * Copyright 2020 Cognite AS
 */

import nock from 'nock';
import { CogniteClient3dV2Extensions } from '../../utils/CogniteClient3dV2Extensions';
import { CogniteClient } from '@cognite/sdk';

describe('CogniteClient3dV2Extensions', () => {
  const appId = 'reveal-CogniteClient3dV2Extensions-test';
  const baseUrl = 'https://localhost';
  const sdk = new CogniteClient({
    appId,
    baseUrl
  });
  const sdkExt = new CogniteClient3dV2Extensions(sdk);

  test('getOutputs() throws error when server returns 400', async () => {
    nock(/.*/)
      .post(/.*/)
      .reply(400, {});

    expect(sdkExt.getOutputs('externalId')).rejects.toThrowError();
  });

  test('getOutputs() with empty outputs in response, returns empty list', async () => {
    // Arrange
    const response = {
      items: [
        {
          model: {
            externalId: 'externalId'
          },
          outputs: []
        }
      ]
    };
    nock(/.*/)
      .post(/.*/)
      .reply(200, response);

    // Act
    const result = await sdkExt.getOutputs('externalId');

    // Assert
    expect(result).toEqual({ ...response.items[0] });
  });

  test('getOuputs() with two outputs, returns both outputs', async () => {
    // Arrange
    const response = {
      items: [
        {
          model: {
            id: 42
          },
          outputs: [
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
        }
      ]
    };
    nock(/.*/)
      .post(/.*/)
      .reply(200, response);

    // Act
    const result = await sdkExt.getOutputs(42);

    // Assert
    expect(result).toEqual({ ...response.items[0] });
  });
});
