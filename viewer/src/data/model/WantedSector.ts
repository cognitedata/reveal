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
  // TODO 2020-05-05 larsmoa: Remove SectorModelTransformation in WantedSector
  cadModelTransformation: SectorModelTransformation;
  scene: SectorScene;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}
