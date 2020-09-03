/*!
 * Copyright 2020 Cognite AS
 */
import { CameraConfiguration, ModelTransformation } from './types';
import { toThreeMatrix4 } from './threeConverters';

export function transformCameraConfiguration(
  cameraConfiguration: CameraConfiguration | undefined,
  modelTransformation: ModelTransformation
): CameraConfiguration | undefined {
  if (cameraConfiguration === undefined) {
    return undefined;
  }

  const { position, target } = cameraConfiguration;
  const matrix = toThreeMatrix4(modelTransformation.modelMatrix);
  position.applyMatrix4(matrix);
  target.applyMatrix4(matrix);
  return {
    position,
    target
  };
}
