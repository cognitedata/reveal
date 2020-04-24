/*!
 * Copyright 2020 Cognite AS
 */

import { SectorMetadata, SectorModelTransformation } from '../../models/cad/types';
import { LevelOfDetail } from './LevelOfDetail';
import { ModelDataRetriever } from '../../datasources/ModelDataRetriever';

export interface WantedSector {
  cadModelIdentifier: string;
  dataRetriever: ModelDataRetriever;
  cadModelTransformation: SectorModelTransformation;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}
