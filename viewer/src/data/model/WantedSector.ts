/*!
 * Copyright 2020 Cognite AS
 */

import { SectorMetadata, SectorModelTransformation, SectorScene } from '../../models/cad/types';
import { LevelOfDetail } from './LevelOfDetail';
import { ModelDataRetriever } from '../../datasources/ModelDataRetriever';

export interface WantedSector {
  cadModelIdentifier: string;
  dataRetriever: ModelDataRetriever;
  cadModelTransformation: SectorModelTransformation;
  scene: SectorScene;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}
