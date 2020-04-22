/*!
 * Copyright 2020 Cognite AS
 */

import { LevelOfDetail } from '../data/model/LevelOfDetail';
import { SectorScene, SectorMetadata } from '../models/cad/types';
import { traverseUpwards, traverseDepthFirst } from '../utils/traversal';
import { PrioritizedWantedSector } from './types';

export class TakenSectorTree {
  get totalCost(): number {
    return this._totalCost;
  }
  private readonly sectors: {
    sector: SectorMetadata;
    priority: number;
    cost: number;
    lod: LevelOfDetail;
  }[] = [];
  private _totalCost = 0.0;

  constructor(sectorRoot: SectorMetadata) {
    // Allocate space for all sectors
    traverseDepthFirst(sectorRoot, x => {
      this.sectors.length = Math.max(this.sectors.length, x.id);
      this.sectors[x.id] = { sector: x, priority: -1, cost: 0, lod: LevelOfDetail.Discarded };
      return true;
    });
    this.setSectorLod(sectorRoot.id, LevelOfDetail.Simple);
  }

  getWantedSectorCount(): number {
    return this.sectors.reduce((count, x) => {
      count = x.lod !== LevelOfDetail.Discarded ? count + 1 : count;
      return count;
    }, 0);
  }

  toWantedSectors(scene: SectorScene): PrioritizedWantedSector[] {
    return this.sectors
      .map((x, id) => {
        const wanted: PrioritizedWantedSector = {
          sectorId: id,
          levelOfDetail: x.lod,
          metadata: x.sector,
          priority: x.priority,
          scene
        };
        return wanted;
      })
      .sort((l, r) => r.priority - l.priority);
  }

  markSectorDetailed(sectorId: number, priority: number) {
    this.setSectorPriority(sectorId, priority);
    if (this.sectors[sectorId].lod === LevelOfDetail.Detailed) {
      return;
    }
    // if (this.getSectorLod(sectorId) === LevelOfDetail.Simple) {
    //   this.replaceSimpleWithDetailed(sectorId);
    // } else {
    //   this.setSectorLod(sectorId, LevelOfDetail.Detailed);
    // }
    // Walk tree upwards and:
    // - 1. find simple sectors and replace with detailed
    //      by marking all children as simple
    // - 2. add all anchestors as detailed
    traverseUpwards(this.sectors[sectorId].sector, x => {
      switch (this.sectors[x.id].lod) {
        case LevelOfDetail.Simple:
          this.replaceSimpleWithDetailed(x.id);
          break;
        case LevelOfDetail.Discarded:
          this.setSectorLod(x.id, LevelOfDetail.Detailed);
          break;
        default:
        // Already detailed
      }
      return true;
    });

    this.markAllDiscardedChildrenAsSimple(sectorId);
  }

  /**
   * Replaces a Simple sector by marking all its non-detailed children as Simple and
   * marking the sector itself Detailed.
   */
  private replaceSimpleWithDetailed(sectorId: number) {
    assert(
      this.sectors[sectorId].lod === LevelOfDetail.Simple,
      `Sector ${sectorId} must be a Simple-sector, but got ${this.sectors[sectorId].lod}`
    );
    this.setSectorLod(sectorId, LevelOfDetail.Detailed);
    this.markAllDiscardedChildrenAsSimple(sectorId);
  }

  private markAllDiscardedChildrenAsSimple(sectorId: number) {
    for (const child of this.sectors[sectorId].sector.children) {
      if (this.getSectorLod(child.id) === LevelOfDetail.Discarded) {
        if (child.facesFile.fileName !== null) {
          this.setSectorLod(child.id, LevelOfDetail.Simple);
        } else {
          // Need to drill down yet another level
          this.markAllDiscardedChildrenAsSimple(child.id);
        }
      }
    }
  }
  private setSectorLod(sectorId: number, lod: LevelOfDetail) {
    assert(lod !== LevelOfDetail.Simple || this.sectors[sectorId].sector.facesFile.fileName !== null);
    this.sectors[sectorId].lod = lod;
    this._totalCost -= this.sectors[sectorId].cost;
    this.sectors[sectorId].cost = computeSectorCost(this.sectors[sectorId].sector, lod);
    this._totalCost += this.sectors[sectorId].cost;
  }
  private setSectorPriority(sectorId: number, priority: number) {
    this.sectors[sectorId].priority = priority;
  }
  private getSectorLod(sectorId: number): LevelOfDetail {
    return this.sectors[sectorId].lod;
  }
}

function assert(condition: boolean, message: string = 'assertion hit') {
  // tslint:disable-next-line: no-console
  console.assert(condition, message);
}

function computeSectorCost(metadata: SectorMetadata, lod: LevelOfDetail): number {
  switch (lod) {
    case LevelOfDetail.Detailed:
      return metadata.indexFile.downloadSize;
    case LevelOfDetail.Simple:
      return metadata.facesFile.downloadSize;
    default:
      throw new Error(`Can't compute cost for lod ${lod}`);
  }
}
