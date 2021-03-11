/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

export class SectorNode extends THREE.Group {
  public readonly sectorId: number;
  public group?: THREE.Group;

  constructor(sectorId: number, sectorPath: string) {
    super();
    this.name = `Sector ${sectorPath} [id=${sectorId}]`;
    this.sectorId = sectorId;
  }
}
