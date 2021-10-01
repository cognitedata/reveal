/*!
 * Copyright 2021 Cognite AS
 */

import { Model3DOutputList } from './Model3DOutputList';

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
