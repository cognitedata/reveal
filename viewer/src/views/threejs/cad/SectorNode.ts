/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

export class SectorNode extends THREE.Group {
  public readonly sectorId: number;

  constructor(sectorId: number, sectorPath: string) {
    super();
    this.name = `Sector ${sectorPath} [id=${sectorId}]`;
    this.sectorId = sectorId;
  }
}
