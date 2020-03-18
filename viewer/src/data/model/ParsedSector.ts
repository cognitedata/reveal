/*!
 * Copyright 2020 Cognite AS
 */

import { LevelOfDetail } from './LevelOfDetail';
import { Sector, SectorQuads, SectorMetadata } from '../../models/cad/types';

export interface ParsedSector {
  id: number;
  data: null | Sector | SectorQuads;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}
