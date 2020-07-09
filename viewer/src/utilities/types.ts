/*!
 * Copyright 2020 Cognite AS
 */

import { mat4 } from 'gl-matrix';

export enum File3dFormat {
  EptPointCloud = 'ept-pointcloud',
  RevealCadModel = 'reveal-directory',
  AnyFormat = 'all-outputs'
}

/**
 * Represents the transformation matrix for a model. Stores both the model matrix and the inverse matrix.
 */
export type ModelTransformation = {
  readonly modelMatrix: mat4;
  readonly inverseModelMatrix: mat4;
};
