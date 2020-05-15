/*!
 * Copyright 2020 Cognite AS
 */

import { SectorModelTransformation } from '../internal/sector/types';
import { SectorScene } from '../internal/sector/SectorScene';

export interface CadModelMetadata {
  blobUrl: string;
  modelTransformation: SectorModelTransformation;
  scene: SectorScene;
}
