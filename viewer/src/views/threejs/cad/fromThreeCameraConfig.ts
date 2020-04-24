/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { vec3, mat4 } from 'gl-matrix';
import { fromThreeVector3, fromThreeMatrix } from '../utilities';
import { map } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';

export const fromCdfToThreeJsCoordinates = mat4.fromValues(1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1);
export const fromThreeJsToCdfCoordinates = mat4.invert(mat4.create(), fromCdfToThreeJsCoordinates)!;
// TODO: j-bjorne 21-04-20: Move functionality and from to matrices
export const modelTransformation = {
  modelMatrix: fromCdfToThreeJsCoordinates,
  inverseModelMatrix: fromThreeJsToCdfCoordinates
};
const updateVars = {
  cameraPosition: vec3.create(),
  cameraModelMatrix: mat4.create(),
  projectionMatrix: mat4.create()
};

export interface CameraConfig {
  readonly cameraFov: number;
  readonly cameraPosition: vec3;
  readonly cameraModelMatrix: mat4;
  readonly projectionMatrix: mat4;
}

export function fromThreeCameraConfig(): OperatorFunction<THREE.PerspectiveCamera, CameraConfig> {
  return map(camera => {
    const { cameraPosition, cameraModelMatrix, projectionMatrix } = updateVars;
    fromThreeVector3(cameraPosition, camera.position, modelTransformation);
    fromThreeMatrix(cameraModelMatrix, camera.matrixWorld, modelTransformation);
    fromThreeMatrix(projectionMatrix, camera.projectionMatrix);
    return {
      cameraFov: camera.fov,
      cameraPosition,
      cameraModelMatrix,
      projectionMatrix
    };
  });
}
