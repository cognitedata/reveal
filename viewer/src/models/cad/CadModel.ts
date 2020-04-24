/*!
 * Copyright 2020 Cognite AS
 */

import { SectorScene, SectorModelTransformation } from './types';
import { ModelDataRetriever } from '../../datasources/ModelDataRetriever';

export interface CadModel {
  identifier: string;
  dataRetriever: ModelDataRetriever;
  modelTransformation: SectorModelTransformation;
  scene: SectorScene;
}
