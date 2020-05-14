/*!
 * Copyright 2020 Cognite AS
 */

import { SectorModelTransformation } from '../../../models/cad/types';
import { SectorScene } from '../../../models/cad/SectorScene';
import { ModelDataRetriever } from '../../../datasources/ModelDataRetriever';

export interface CadModel {
  identifier: string;
  dataRetriever: ModelDataRetriever;
  modelTransformation: SectorModelTransformation;
  scene: SectorScene;
}
