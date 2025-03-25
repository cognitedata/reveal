/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { SectorScene } from '../utilities/types';
import { CameraConfiguration } from '@reveal/utilities';
import { File3dFormat, ModelIdentifier } from '@reveal/data-providers';

export interface CadModelMetadata {
  /**
   * A unique identifier of the model.
   */
  readonly modelIdentifier: ModelIdentifier;

  /**
   * File format of the 3D model (i3d/f3d, gltf, etc.)
   */
  readonly format: File3dFormat;

  /**
   * Revision of the {@link CadModelMetadata.format} (e.g. 8 for "legacy models" or
   * 9 for GLTF).
   */
  readonly formatVersion: number;

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
