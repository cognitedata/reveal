/*!
 * Copyright 2020 Cognite AS
 */

import { SectorModelTransformation } from './types';
import { SectorScene } from './SectorScene';
import { ModelDataRetriever } from '../../datasources/ModelDataRetriever';

export interface CadModel {
  identifier: string;
  dataRetriever: ModelDataRetriever;
  modelTransformation: SectorModelTransformation;
  scene: SectorScene;
}
