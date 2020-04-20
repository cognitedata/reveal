/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { LevelOfDetail } from './LevelOfDetail';
import { SectorMetadata } from '../../models/cad/types';
import { ExternalSource, CDFSource } from './DataSource';

export interface ConsumedSector {
  dataSource: CDFSource | ExternalSource;
  metadata: SectorMetadata;
  levelOfDetail: LevelOfDetail;
  group: THREE.Group | undefined;
}
