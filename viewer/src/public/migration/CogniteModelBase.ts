/*!
 * Copyright 2020 Cognite AS
 */

import { SupportedModelTypes } from '../types';
import { CameraConfiguration } from './types';

/**
 * Base class for 3D models supported by {@link Cognite3DViewer}.
 * @module @cognite/reveal
 */
export interface CogniteModelBase {
  readonly type: SupportedModelTypes;
  dispose(): void;
  getModelBoundingBox(outBbox?: THREE.Box3): THREE.Box3;
  /**
   * Retrieves the camera position and target stored for the model. Typically this
   * is used to store a good starting position for a model. Returns `undefined` if there
   * isn't any stored camera configuration for the model.
   */
  getCameraConfiguration(): CameraConfiguration | undefined;

  /** @internal */
  updateTransformation(matrix: THREE.Matrix4): void;
}
