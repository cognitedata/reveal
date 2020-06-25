/*!
 * Copyright 2020 Cognite AS
 */

import nock from 'nock';
import { CogniteClient3dExtensions } from '@/utilities/networking/CogniteClient3dExtensions';
import { CogniteClient } from '@cognite/sdk';
import { Model3DOutputList } from '@/utilities/networking/Model3DOutputList';
import { File3dFormat } from '@/utilities';

describe('CogniteClient3dExtensions', () => {
  const appId = 'reveal-CogniteClient3dV2Extensions-test';
  const baseUrl = 'http://localhost';
  const client = new CogniteClient({
    appId,
    baseUrl
  });
  client.loginWithApiKey({ apiKey: 'dummy', project: 'unittest' });
  const clientExt = new CogniteClient3dExtensions(client);
  const apiPath: RegExp = /\/api\/v1\/projects\/unittest\/3d\/.*/;

  test('getOutputs() throws error when server returns 400', async () => {
    const scope = nock(/.*/)
      .get(apiPath)
      .reply(400, {});

    await expect(clientExt.getOutputs({ modelId: 1337, revisionId: 42 })).rejects.toThrowError();
    expect(scope.isDone()).toBeTrue();
  });

  test('getOutputs() with empty outputs in response, returns empty list', async () => {
    // Arrange
    const response = {
      items: []
    };
    nock(/.*/)
      .get(apiPath)
      .reply(200, response);

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
    nock(/.*/)
      .get(apiPath)
      .reply(200, response);

    // Act
    const result = await clientExt.getOutputs({ modelId: 1337, revisionId: 42 });

    // Assert
    expect(result).toEqual({ modelId: 1337, revisionId: 42, outputs: response.items });
  });

  test('retrieveBinaryBlob() with binary data returns valid ArrayBuffer', async () => {
    // Arrange
    const response = '0123456789';
    nock(/.*/)
      .get(/.*/)
      .reply(200, response, { 'content-type': 'binary' });

    // Act
    const result = await clientExt.getCadSectorFile(baseUrl, 'sector_5.i3d');

    // Assert
    const expected = new Array<number>(response.length);
    for (let i = 0; i < response.length; i++) {
      expected[i] = response.charCodeAt(i);
    }
    const view = new Uint8Array(result);
    expect(view.toString()).toEqual(expected.toString());
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
    nock(/.*/)
      .post(apiPath)
      .reply(200, response);

    // Act & Assert
    expect(
      clientExt.getModelUrl({ modelId: 1337, revisionId: 42, format: File3dFormat.RevealCadModel })
    ).rejects.toThrowError();
  });
});

describe('Model3dOutputList', () => {
  test('findMostRecentOutput() with no outputs of type, returns undefined', () => {
    const outputs = new Model3DOutputList(1337, 42, [{ format: 'ept-pointcloud', version: 1, blobId: 1 }]);
    expect(outputs.findMostRecentOutput('reveal')).toBeUndefined();
  });

  test('findMostRecentOutput() with single output of given type, returns version', () => {
    const outputs = new Model3DOutputList(1337, 42, [{ format: 'ept-pointcloud', version: 1, blobId: 1 }]);
    expect(outputs.findMostRecentOutput('ept-pointcloud')).not.toBeUndefined();
  });

  test('findMostRecentOutput() with mulitple outputs of given type, returns most recent version', () => {
    const outputs = new Model3DOutputList(1337, 42, [
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
    const outputs = new Model3DOutputList(1337, 42, [
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
});
