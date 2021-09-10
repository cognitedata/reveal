/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { SectorScene } from '../utilities/types';
import { CameraConfiguration } from '@reveal/utilities';

export interface CadModelMetadata {
  /**
   * A unique identifier of the model.
   */
  readonly modelIdentifier: string;

  /**
   * Base URL of the model.
   */
  readonly modelBaseUrl: string;
  /**
   * If not null, geometry outside this box might be clipped
   * away to avoid representing unused geometry. Will typically
   * be used with geometry filters where only a part of the model
   * is loaded.
   * Note that the coordinates of this box is in "model space" and
   * not in "viewer space". To use this to e.g. create clip planes
   * around the geometry, it must be transformed to "viewer space"
   * first.
   */
  readonly geometryClipBox: THREE.Box3 | null;
  /**
   * Matrix transforming from coordinates of the model to ThreeJS
   * coordinates.
   */
  readonly modelMatrix: THREE.Matrix4;
  /**
   * Inverse of {@see modelMatrix}.
   */
  readonly inverseModelMatrix: THREE.Matrix4;
  /**
   * Description of the tree structure holding geometry.
   */
  readonly scene: SectorScene;
  /**
   * Camera configuration stored in CDF (if any).
   */
  readonly cameraConfiguration?: CameraConfiguration;
}
