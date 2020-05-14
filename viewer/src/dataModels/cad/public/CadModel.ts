/*!
 * Copyright 2020 Cognite AS
 */

import { SectorModelTransformation } from '../internal/sector/types';
import { SectorScene } from '../internal/sector/SectorScene';
import { ModelDataRetriever } from '../../../utilities/networking/ModelDataRetriever';

export interface CadModel {
  identifier: string;
  dataRetriever: ModelDataRetriever;
  modelTransformation: SectorModelTransformation;
  scene: SectorScene;
}
