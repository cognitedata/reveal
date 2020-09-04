/*!
 * Copyright 2020 Cognite AS
 */

import { SectorScene } from './sector/types';
import { ModelTransformation, CameraConfiguration } from '@/utilities';

export interface CadModelMetadata {
  blobUrl: string;
  modelTransformation: ModelTransformation;
  cameraConfiguration?: CameraConfiguration;
  scene: SectorScene;
}
