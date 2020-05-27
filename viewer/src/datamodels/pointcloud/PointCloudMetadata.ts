/*!
 * Copyright 2020 Cognite AS
 */

// TODO 25-05-2020 j-bjorne Move SectorModelTransformation to a common place of data types.
import { SectorModelTransformation } from '@/datamodels/cad/sector/types';

export interface PointCloudMetadata {
  blobUrl: string;
  modelTransformation: SectorModelTransformation;
  scene: any;
}
