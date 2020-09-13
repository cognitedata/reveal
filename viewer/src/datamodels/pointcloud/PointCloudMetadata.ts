/*!
 * Copyright 2020 Cognite AS
 */

import { CameraConfiguration } from '@/utilities';

export interface PointCloudMetadata {
  blobUrl: string;
  cameraConfiguration?: CameraConfiguration;
  scene: any;
}
