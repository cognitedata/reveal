/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { SectorModelTransformation, SectorMetadata, SectorScene } from '../../../models/cad/types';
import { vec3, mat4 } from 'gl-matrix';
import { fromThreeVector3, fromThreeMatrix } from '../utilities';
import { determineSectors } from '../../../models/cad/determineSectors';
import { SectorActivator } from '../../../models/cad/initializeSectorLoader';

export class SectorNode extends THREE.Group {
  public readonly sectorId: number;

  constructor(sectorId: number, sectorPath: string) {
    super();
    this.name = `Sector ${sectorPath} [id=${sectorId}]`;
    this.sectorId = sectorId;
  }
}

const updateVars = {
  cameraPosition: vec3.create(),
  cameraModelMatrix: mat4.create(),
  projectionMatrix: mat4.create()
};

export interface RootSectorNodeData {
  rootSector: SectorNode;
  simpleActivator: SectorActivator;
  detailedActivator: SectorActivator;
}
