/*!
 * Copyright 2020 Cognite AS
 */

import { LevelOfDetail } from '../data/model/LevelOfDetail';
import { SectorMetadata } from '../models/cad/types';
import { traverseUpwards, traverseDepthFirst } from '../utils/traversal';
import { PrioritizedWantedSector, DetermineSectorCostDelegate } from './types';
import { CadModel } from '../models/cad/CadModel';

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
  private readonly determineSectorCost: DetermineSectorCostDelegate;

  private _totalCost = 0.0;

  constructor(sectorRoot: SectorMetadata, determineSectorCost: DetermineSectorCostDelegate) {
    this.determineSectorCost = determineSectorCost;
    // Allocate space for all sectors
    traverseDepthFirst(sectorRoot, x => {
      this.sectors.length = Math.max(this.sectors.length, x.id);
      this.sectors[x.id] = { sector: x, priority: -1, cost: 0, lod: LevelOfDetail.Discarded };
      return true;
    });
    this.setSectorLod(sectorRoot.id, LevelOfDetail.Simple);
  }

  determineWantedSectorCount(): number {
    return this.sectors.reduce((count, x) => {
      count = x.lod !== LevelOfDetail.Discarded ? count + 1 : count;
      return count;
    }, 0);
  }

  toWantedSectors(model: CadModel): PrioritizedWantedSector[] {
    return this.sectors
      .map(sector => {
        const wanted: PrioritizedWantedSector = {
          levelOfDetail: sector.lod,
          metadata: sector.sector,
          priority: sector.priority,

          // TODO 2020-05-05 larsmoa: Reduce the number of fields here
          cadModelIdentifier: model.identifier,
          dataRetriever: model.dataRetriever,
          scene: model.scene,
          cadModelTransformation: model.modelTransformation
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
        // Note! When fileName is null the sector is so sparse that there is
        // no geometry in the F3D - we therefore skip such sectors.
        if (child.facesFile.fileName !== null) {
          this.setSectorLod(child.id, LevelOfDetail.Simple);
        }
      }
    }
  }
  private setSectorLod(sectorId: number, lod: LevelOfDetail) {
    assert(lod !== LevelOfDetail.Simple || this.sectors[sectorId].sector.facesFile.fileName !== null);
    this.sectors[sectorId].lod = lod;
    this._totalCost -= this.sectors[sectorId].cost;
    this.sectors[sectorId].cost = this.determineSectorCost(this.sectors[sectorId].sector, lod);
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
