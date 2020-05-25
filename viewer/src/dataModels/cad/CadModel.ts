/*!
 * Copyright 2020 Cognite AS
 */

import { SectorModelTransformation } from './sector/types';
import { SectorScene } from './sector/SectorScene';
import { ModelDataRetriever } from '@/utilities/networking/ModelDataRetriever';

export interface CadModel {
  identifier: string;
  dataRetriever: ModelDataRetriever;
  modelTransformation: SectorModelTransformation;
  scene: SectorScene;
}
