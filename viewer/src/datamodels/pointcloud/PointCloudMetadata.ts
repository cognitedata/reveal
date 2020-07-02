/*!
 * Copyright 2020 Cognite AS
 */

// TODO 25-05-2020 j-bjorne Move SectorModelTransformation to a common place of data types.
import { ModelTransformation } from '@/utilities';

export interface PointCloudMetadata {
  blobUrl: string;
  modelTransformation: ModelTransformation;
  scene: any;
}
