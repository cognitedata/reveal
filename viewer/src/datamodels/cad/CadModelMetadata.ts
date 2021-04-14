/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { SectorScene } from './sector/types';
import { CameraConfiguration } from '../../utilities';

export interface CadModelMetadata {
  /**
   * URL of the model. This is a unique identifier.
   */
  readonly blobUrl: string;
  /**
   * If not null, geometry outside this box might be clipped
   * away to avoid representing unused geometry. Will typically
   * be used with geometry filters where only a part of the model
   * is loaded.
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
