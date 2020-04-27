/*!
 * Copyright 2020 Cognite AS
 */

import { SectorMetadata } from '../../models/cad/types';
import { LevelOfDetail } from './LevelOfDetail';

export interface WantedSector {
  sectorId: number;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}
