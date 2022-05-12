/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { File3dFormat } from './types';

// The below is equal to new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
const cadFromCdfToThreeMatrix = new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);

export function applyDefaultModelTransformation(matrix: THREE.Matrix4, format: File3dFormat | string): void {
  switch (format) {
    case File3dFormat.RevealCadModel:
    case File3dFormat.GltfCadModel:
    case File3dFormat.EptPointCloud:
      matrix.premultiply(cadFromCdfToThreeMatrix);
      break;

    default:
      throw new Error(`Unknown model format '${format}`);
  }
}
