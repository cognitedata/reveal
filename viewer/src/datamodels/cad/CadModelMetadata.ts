/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { SectorScene } from './sector/types';
import { CameraConfiguration } from '../../utilities';

export interface CadModelMetadata {
  blobUrl: string;
  modelMatrix: THREE.Matrix4;
  inverseModelMatrix: THREE.Matrix4;
  cameraConfiguration?: CameraConfiguration;
  scene: SectorScene;
}
