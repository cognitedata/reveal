/*!
 * Copyright 2020 Cognite AS
 */

import { SectorMetadata } from '../../models/cad/types';
import { LevelOfDetail } from './LevelOfDetail';
import { CDFSource, ExternalSource } from './DataSource';

export interface WantedSector {
  dataSource: CDFSource | ExternalSource;
  levelOfDetail: LevelOfDetail;
  metadata: SectorMetadata;
}
