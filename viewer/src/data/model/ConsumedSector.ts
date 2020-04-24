/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { LevelOfDetail } from './LevelOfDetail';
import { SectorMetadata } from '../../models/cad/types';
import { CadNode } from '../../threejs';

export interface ConsumedSector {
  cadModelIdentifier: string;
  metadata: SectorMetadata;
  levelOfDetail: LevelOfDetail;
  group: THREE.Group | undefined;
}
