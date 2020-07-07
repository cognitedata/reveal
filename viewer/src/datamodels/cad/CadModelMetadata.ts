/*!
 * Copyright 2020 Cognite AS
 */

import { SectorScene } from './sector/types';
import { ModelTransformation } from '@/utilities';

export interface CadModelMetadata {
  blobUrl: string;
  modelTransformation: ModelTransformation;
  scene: SectorScene;
}
