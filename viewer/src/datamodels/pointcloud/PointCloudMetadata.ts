/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { CameraConfiguration } from '../../utilities';

export interface PointCloudMetadata {
  blobUrl: string;
  modelMatrix: THREE.Matrix4;
  cameraConfiguration?: CameraConfiguration;
  scene: any;
}
