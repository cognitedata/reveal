/*!
 * Copyright 2021 Cognite AS
 */
import type * as THREE from 'three';

import type { CameraConfiguration } from './CameraConfiguration';

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
