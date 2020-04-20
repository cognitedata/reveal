/*!
 * Copyright 2020 Cognite AS
 */

import { SectorScene, SectorModelTransformation } from './types';
import { ModelDataRetriever } from '../../datasources/ModelDataRetriever';

export interface CadModel {
  dataRetriever: ModelDataRetriever;
  modelTransformation: SectorModelTransformation;
  scene: SectorScene;
}
