/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

import { CameraConfiguration } from './types';

export function transformCameraConfiguration(
  cameraConfiguration: CameraConfiguration | undefined,
  modelMatrix: THREE.Matrix4
): CameraConfiguration | undefined {
  if (cameraConfiguration === undefined) {
    return undefined;
  }

  const { position, target } = cameraConfiguration;
  position.applyMatrix4(modelMatrix);
  target.applyMatrix4(modelMatrix);
  return {
    position,
    target
  };
}
