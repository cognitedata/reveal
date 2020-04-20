/*!
 * Copyright 2020 Cognite AS
 */

import { LevelOfDetail } from './LevelOfDetail';
import { SectorQuads, SectorMetadata, Sector } from '../../models/cad/types';
import { ParseSectorResult, ParseCtmResult } from '../../workers/types/parser.types';
import { CDFSource, ExternalSource } from './DataSource';

export interface ParsedSector {
  dataSource: CDFSource | ExternalSource;
  metadata: SectorMetadata;
  data: null | ParseSectorResult | ParseCtmResult | Sector | SectorQuads;
  levelOfDetail: LevelOfDetail;
}
