/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { SectorActivator } from '../../../models/cad/initializeSectorLoader';

export class SectorNode extends THREE.Group {
  public readonly sectorId: number;

  constructor(sectorId: number, sectorPath: string) {
    super();
    this.name = `Sector ${sectorPath} [id=${sectorId}]`;
    this.sectorId = sectorId;
  }
}

export interface RootSectorNodeData {
  rootSector: SectorNode;
  simpleActivator: SectorActivator;
  detailedActivator: SectorActivator;
}
