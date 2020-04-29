/*!
 * Copyright 2020 Cognite AS
 */

import { SectorMetadata, SectorModelTransformation } from '../../models/cad/types';
import { LevelOfDetail } from './LevelOfDetail';
import { ModelDataRetriever } from '../../datasources/ModelDataRetriever';
import { SectorScene } from '../../models/cad/SectorScene';

export interface WantedSector {
  cadModelIdentifier: string;
  dataRetriever: ModelDataRetriever;
  cadModelTransformation: SectorModelTransformation;
  scene: SectorScene;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}
