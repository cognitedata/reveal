/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { File3dFormat, fromThreeMatrix, ModelTransformation } from '..';
import { mat4 } from 'gl-matrix';

// The below is equal to new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
const cadFromCdfToThreeMatrix = new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);

export function applyDefaultModelTransformation(matrix: THREE.Matrix4, format: File3dFormat | string): void {
  switch (format) {
    case File3dFormat.RevealCadModel:
      matrix.premultiply(cadFromCdfToThreeMatrix);
      break;

    case File3dFormat.EptPointCloud:
      // No action, identity transform
      break;

    default:
      throw new Error(`Unknown model format '${format}`);
  }
}

export function createModelTransformation(modelMatrix: THREE.Matrix4): ModelTransformation {
  const inverseModelMatrix = new THREE.Matrix4().getInverse(modelMatrix);
  return {
    modelMatrix: fromThreeMatrix(mat4.create(), modelMatrix),
    inverseModelMatrix: fromThreeMatrix(mat4.create(), inverseModelMatrix)
  };
}
