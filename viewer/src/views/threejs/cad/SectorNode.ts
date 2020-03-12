/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { LevelOfDetail } from '../../../data/model/LevelOfDetail';

export class SectorNode extends THREE.Group {
  public readonly sectorId: number;
  public lod: LevelOfDetail;
  public group?: THREE.Group;

  constructor(sectorId: number, sectorPath: string) {
    super();
    this.name = `Sector ${sectorPath} [id=${sectorId}]`;
    this.sectorId = sectorId;
    this.lod = LevelOfDetail.Discarded;
  }
}

