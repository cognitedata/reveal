/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { File3dFormat } from '../types';
import { CDF_TO_VIEWER_TRANSFORMATION } from '@reveal/utilities';

export function applyDefaultModelTransformation(matrix: THREE.Matrix4, format: File3dFormat | string): void {
  switch (format) {
    case File3dFormat.GltfCadModel:
    case File3dFormat.EptPointCloud:
      matrix.premultiply(CDF_TO_VIEWER_TRANSFORMATION);
      break;

    default:
      throw new Error(`Unknown model format '${format}`);
  }
}
