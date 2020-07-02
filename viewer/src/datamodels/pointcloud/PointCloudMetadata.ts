/*!
 * Copyright 2020 Cognite AS
 */

import { ModelTransformation } from '@/utilities';

export interface PointCloudMetadata {
  blobUrl: string;
  modelTransformation: ModelTransformation;
  scene: any;
}
