/*!
 * Copyright 2020 Cognite AS
 */

import { SectorMetadata, SectorModelTransformation } from './types';
import { LevelOfDetail } from './LevelOfDetail';
import { ModelDataRetriever } from '../../../../utilities/networking/ModelDataRetriever';
import { SectorScene } from './SectorScene';

export interface WantedSector {
  cadModelIdentifier: string;
  dataRetriever: ModelDataRetriever;
  // TODO 2020-05-05 larsmoa: Remove SectorModelTransformation in WantedSector
  cadModelTransformation: SectorModelTransformation;
  scene: SectorScene;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}
