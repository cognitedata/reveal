/*!
 * Copyright 2020 Cognite AS
 */

import { SectorModelTransformation } from './sector/types';
import { SectorScene } from './sector/SectorScene';

export interface CadModelMetadata {
  blobUrl: string;
  modelTransformation: SectorModelTransformation;
  scene: SectorScene;
}
