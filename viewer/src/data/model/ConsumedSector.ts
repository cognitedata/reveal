/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { LevelOfDetail } from './LevelOfDetail';
import { SectorMetadata } from '../../models/cad/types';

export interface ConsumedSector {
  sectorId: number;
  levelOfDetail: LevelOfDetail;
  group: THREE.Group | undefined;
  metadata: SectorMetadata;
}
