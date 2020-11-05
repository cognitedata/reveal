/*!
 * Copyright 2020 Cognite AS
 */

import { CameraConfiguration } from './types';
import { SupportedModelTypes } from '../../datamodels/base';

/**
 * Base class for 3D models supported by {@link Cognite3DViewer}.
 * @module @cognite/reveal
 */
export interface CogniteModelBase {
  readonly type: SupportedModelTypes;
  dispose(): void;
  getModelBoundingBox(outBbox?: THREE.Box3): THREE.Box3;
  getCameraConfiguration(): CameraConfiguration | undefined;
  setModelTransformation(matrix: THREE.Matrix4): void;
  getModelTransformation(out?: THREE.Matrix4): THREE.Matrix4;
}
