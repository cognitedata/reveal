/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { SectorScene } from './sector/types';
import { CameraConfiguration } from '@/utilities';

export interface CadModelMetadata {
  blobUrl: string;
  modelMatrix: THREE.Matrix4;
  // modelTransformation: ModelTransformation;
  cameraConfiguration?: CameraConfiguration;
  scene: SectorScene;
}
