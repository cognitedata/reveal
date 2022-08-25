/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { CameraConfiguration } from '@reveal/utilities';
import { File3dFormat } from '@reveal/modeldata-api';

export interface PointCloudMetadata {
  readonly modelIdentifier: symbol;
  readonly format: File3dFormat;
  readonly formatVersion: number;

  readonly modelBaseUrl: string;
  readonly modelMatrix: THREE.Matrix4;
  readonly cameraConfiguration?: CameraConfiguration;
  readonly scene: any;
}
