/*!
 * Copyright 2020 Cognite AS
 */

import { SectorModelTransformation, SectorScene } from './sector/types';

export interface CadModelMetadata {
  blobUrl: string;
  modelTransformation: SectorModelTransformation;
  scene: SectorScene;
}
