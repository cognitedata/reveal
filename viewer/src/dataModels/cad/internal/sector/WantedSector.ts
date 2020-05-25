/*!
 * Copyright 2020 Cognite AS
 */

import { SectorMetadata } from './types';
import { LevelOfDetail } from './LevelOfDetail';

export interface WantedSector {
  blobUrl: string;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}
