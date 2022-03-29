/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { AutoDisposeGroup } from '@reveal/utilities';
import { LevelOfDetail } from '../cad/LevelOfDetail';

export class SectorNode extends THREE.Group {
  public readonly sectorPath: string;
  public readonly sectorId: number;
  public readonly bounds: THREE.Box3;
  public readonly depth: number;

  private _group?: AutoDisposeGroup;
  private _lod = LevelOfDetail.Discarded;
  private _updatedTimestamp: number = Date.now();

  constructor(sectorId: number, sectorPath: string, bounds: THREE.Box3) {
    super();
    this.name = `Sector ${sectorPath} [id=${sectorId}]`;
    this.sectorId = sectorId;
    this.sectorPath = sectorPath;
    this.bounds = bounds;
    this.depth = determineSectorDepth(sectorPath);
  }

  get levelOfDetail(): LevelOfDetail {
    return this._lod;
  }

  get group(): THREE.Group | undefined {
    return this._group;
  }

  get updatedTimestamp(): number {
    return this._updatedTimestamp;
  }

  updateGeometry(geomtryGroup: AutoDisposeGroup | undefined, levelOfDetail: LevelOfDetail): void {
    this.resetGeometry();
    this._group = geomtryGroup;
    if (this._group !== undefined) {
      this._group.reference();
    }
    this._lod = levelOfDetail;
    this._updatedTimestamp = Date.now();
    this.visible = this._lod !== LevelOfDetail.Discarded;
    this.updateMatrixWorld(true);
  }

  dereference(): void {
    if (this._group !== undefined) {
      this._group.dereference();
    }
  }
  
  resetGeometry(): void {
    if (this._group !== undefined) {
      this._group.dereference();
      this.remove(this._group);
    }

    this._group = undefined;
    this._lod = LevelOfDetail.Discarded;
    this._updatedTimestamp = Date.now();
  }
}

function determineSectorDepth(path: string): number {
  let depth = 0;
  for (let i = 0; i < path.length; ++i) {
    depth += path[i] === '/' ? 1 : 0;
  }
  return depth - 1;
}
