/*!
 * Copyright 2020 Cognite AS
 */

import { LevelOfDetail } from './LevelOfDetail';
import { SectorQuads, SectorMetadata, Sector } from '../../models/cad/types';
import { ParseSectorResult, ParseCtmResult } from '../../workers/types/parser.types';

export interface ParsedSector {
  id: number;
  data: null | ParseSectorResult | ParseCtmResult | Sector | SectorQuads;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}
