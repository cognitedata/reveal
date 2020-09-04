/*!
 * Copyright 2020 Cognite AS
 */

import { ModelTransformation, CameraConfiguration } from '@/utilities';

export interface PointCloudMetadata {
  blobUrl: string;
  modelTransformation: ModelTransformation;
  cameraConfiguration?: CameraConfiguration;
  scene: any;
}
