/*!
 * Copyright 2020 Cognite AS
 */

import { mat4, quat } from 'gl-matrix';

// Roate +Y to -Z
// TODO: j-bjorne 15-05-2020: These already exist in fromThreeCameraConfig. Should be defined one place?
export const fromCdfToThreeJsCoordinates = mat4.fromValues(1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1);
export const fromThreeJsToCdfCoordinates = mat4.invert(mat4.create(), fromCdfToThreeJsCoordinates)!;

export function constructMatrixFromRotation(rotation: [number, number, number] | null): mat4 {
  const matrix = mat4.identity(mat4.create());
  const quaternion = quat.create();
  if (rotation != null) {
    rotation = [(180.0 * rotation[0]) / Math.PI, (180.0 * rotation[1]) / Math.PI, (180.0 * rotation[2]) / Math.PI];
    quat.fromEuler(quaternion, rotation[0], rotation[1], rotation[2]);
    mat4.fromQuat(matrix, quaternion);
  }
  // TODO 20191018 larsmoa: ThreeJS specific - move to "view".
  // Always rotate Z up to Y up as three.js uses this coordinate system.
  return mat4.mul(mat4.create(), fromCdfToThreeJsCoordinates, matrix);
}
