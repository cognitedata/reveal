/*!
 * Copyright 2020 Cognite AS
 */

import { LevelOfDetail } from './LevelOfDetail';
import { SectorQuads, SectorMetadata, Sector } from './types';
import { ParseSectorResult, ParseCtmResult } from '@/utilities/workers/types/parser.types';

export interface ParsedSector {
  cadModelIdentifier: string;
  metadata: SectorMetadata;
  data: null | ParseSectorResult | ParseCtmResult | Sector | SectorQuads;
  levelOfDetail: LevelOfDetail;
}
