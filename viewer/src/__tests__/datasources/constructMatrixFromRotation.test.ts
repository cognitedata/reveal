/*!
 * Copyright 2019 Cognite AS
 */

import { constructMatrixFromRotation } from '../../datasources/constructMatrixFromRotation';
import { vec3 } from 'gl-matrix';

describe('constructMatrixFromRotation', () => {
  test('null input returns matrix that flips +Y to -Z', () => {
    const matrix = constructMatrixFromRotation(null);
    const transformed = vec3.transformMat4(vec3.create(), vec3.fromValues(1, 2, 3), matrix);
    expect(transformed).toContainAllValues([1, 3, -2]);
  });

  test('zero input, returns matrix that flips +Y to -Z', () => {
    const matrix = constructMatrixFromRotation([0, 0, 0]);
    const transformed = vec3.transformMat4(vec3.create(), vec3.fromValues(1, 2, 3), matrix);
    expect(transformed).toContainAllValues([1, 3, -2]);
  });

  test('rotate 180 degrees around Y, returns correct result', () => {
    const matrix = constructMatrixFromRotation([Math.PI, 0, 0]);
    const transformed = vec3.transformMat4(vec3.create(), vec3.fromValues(1, 2, 3), matrix);
    expect(transformed).toContainAllValues([1, -3, 2]);
  });
});
