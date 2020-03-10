/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { Lod } from '../../../rxjs';

export class SectorNode extends THREE.Group {
  public readonly sectorId: number;
  public lod: Lod;
  public group?: THREE.Group;

  constructor(sectorId: number, sectorPath: string) {
    super();
    this.name = `Sector ${sectorPath} [id=${sectorId}]`;
    this.sectorId = sectorId;
    this.lod = Lod.Discarded;
  }
}

