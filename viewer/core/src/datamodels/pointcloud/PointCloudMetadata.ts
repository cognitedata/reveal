/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { CameraConfiguration } from '@reveal/cad-parsers';

export interface PointCloudMetadata {
  modelBaseUrl: string;
  modelMatrix: THREE.Matrix4;
  cameraConfiguration?: CameraConfiguration;
  scene: any;
}
