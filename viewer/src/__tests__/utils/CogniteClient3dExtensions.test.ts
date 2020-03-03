/*!
 * Copyright 2020 Cognite AS
 */

import nock from 'nock';
import { CogniteClient3dExtensions, Model3dOutputList } from '../../utils/CogniteClient3dExtensions';
import { CogniteClient } from '@cognite/sdk';

describe('CogniteClient3dExtensions', () => {
  const appId = 'reveal-CogniteClient3dV2Extensions-test';
  const baseUrl = 'https://localhost';
  const sdk = new CogniteClient({
    appId,
    baseUrl
  });
  const sdkExt = new CogniteClient3dExtensions(sdk);

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

  test('retrieveBinaryBlob() with binary data returns valid ArrayBuffer', async () => {
    // Arrange
    const response = '0123456789';
    nock(/.*/)
      .get(/.*/)
      .reply(200, response, { 'content-type': 'binary' });

    // Act
    const result = await sdkExt.retrieveBinaryBlob(10);

    // Assert
    const expected = new Array<number>(response.length);
    for (let i = 0; i < response.length; i++) {
      expected[i] = response.charCodeAt(i);
    }
    const view = new Uint8Array(result);
    expect(view.toString()).toEqual(expected.toString());
  });
});

describe('Model3dOutputList', () => {
  test('findMostRecentOutput() with no outputs of type, returns undefined', () => {
    const outputs = new Model3dOutputList({ id: 42 }, [{ format: 'ept-pointcloud', version: 1, blobId: 1 }]);
    expect(outputs.findMostRecentOutput('reveal')).toBeUndefined();
  });

  test('findMostRecentOutput() with single output of given type, returns version', () => {
    const outputs = new Model3dOutputList({ id: 42 }, [{ format: 'ept-pointcloud', version: 1, blobId: 1 }]);
    expect(outputs.findMostRecentOutput('ept-pointcloud')).not.toBeUndefined();
  });

  test('findMostRecentOutput() with mulitple outputs of given type, returns most recent version', () => {
    const outputs = new Model3dOutputList({ id: 42 }, [
      { format: 'ept-pointcloud', version: 1, blobId: 1 },
      { format: 'ept-pointcloud', version: 5, blobId: 5 },
      { format: 'ept-pointcloud', version: 3, blobId: 3 },
      { format: 'ept-pointcloud', version: 2, blobId: 2 },
      { format: 'ept-pointcloud', version: 4, blobId: 4 },
      { format: 'reveal', version: 8, blobId: 78 }
    ]);
    expect(outputs.findMostRecentOutput('ept-pointcloud')).toEqual({ format: 'ept-pointcloud', version: 5, blobId: 5 });
  });

  test('findMostRecentOutput() with list of supported formats, returns most recent supported', () => {
    const outputs = new Model3dOutputList({ id: 42 }, [
      { format: 'ept-pointcloud', version: 1, blobId: 1 },
      { format: 'ept-pointcloud', version: 5, blobId: 5 },
      { format: 'ept-pointcloud', version: 3, blobId: 3 },
      { format: 'ept-pointcloud', version: 2, blobId: 2 },
      { format: 'ept-pointcloud', version: 4, blobId: 4 },
      { format: 'reveal', version: 8, blobId: 78 }
    ]);
    expect(outputs.findMostRecentOutput('ept-pointcloud', [1, 3, 4])).toEqual({
      format: 'ept-pointcloud',
      version: 4,
      blobId: 4
    });
  });

  test('findMostRecentOutput() with ', () => {});
});
