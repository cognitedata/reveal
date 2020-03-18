/*!
 * Copyright 2020 Cognite AS
 */

import { SectorMetadata } from '../../models/cad/types';
import { LevelOfDetail } from './LevelOfDetail';

export interface WantedSector {
  id: number;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}
