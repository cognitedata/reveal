/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { CameraConfiguration } from '@reveal/utilities';
import { File3dFormat, ModelIdentifier } from '@reveal/modeldata-api';

export interface PointCloudMetadata {
  readonly format: File3dFormat;
  readonly formatVersion: number;

  readonly modelBaseUrl: string;
  readonly modelIdentifier: ModelIdentifier;
  readonly modelMatrix: THREE.Matrix4;
  readonly cameraConfiguration?: CameraConfiguration;
  readonly scene: any;
}
