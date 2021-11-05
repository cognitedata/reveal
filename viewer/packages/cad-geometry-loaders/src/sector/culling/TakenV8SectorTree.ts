/*!
 * Copyright 2021 Cognite AS
 */

import { SectorMetadata, LevelOfDetail, V8SectorMetadata } from '@reveal/cad-parsers';
import {
  PrioritizedWantedSector,
  DetermineSectorCostDelegate,
  SectorCost,
  reduceSectorCost,
  addSectorCost
} from './types';

import { traverseDepthFirst } from '@reveal/utilities';

import log from '@reveal/logger';

export class TakenV8SectorTree {
  get totalCost(): SectorCost {
    return this._totalCost;
  }
  private readonly sectors: {
    sector: V8SectorMetadata;
    parentIndex: number;
    priority: number;
    cost: SectorCost;
    lod: LevelOfDetail;
  }[] = [];
  private readonly determineSectorCost: DetermineSectorCostDelegate;

  private readonly _totalCost: SectorCost = { downloadSize: 0, drawCalls: 0, renderCost: 0 };

  constructor(sectorRoot: V8SectorMetadata, determineSectorCost: DetermineSectorCostDelegate) {
    this.determineSectorCost = determineSectorCost;
    // Allocate space for all sectors
    traverseDepthFirst(sectorRoot as SectorMetadata, x => {
      this.sectors.length = Math.max(this.sectors.length, x.id);
      this.sectors[x.id] = {
        sector: x as V8SectorMetadata,
        parentIndex: -1,
        priority: -1,
        cost: { downloadSize: 0, drawCalls: 0, renderCost: 0 },
        lod: LevelOfDetail.Discarded
      };
      return true;
    });
    // Assign parents
    for (let i = 0; i < this.sectors.length; ++i) {
      const sectorContainer = this.sectors[i];
      if (sectorContainer !== undefined) {
        const childrenIndexes = sectorContainer.sector.children.map(x => x.id);
        for (const childIndex of childrenIndexes) {
          this.sectors[childIndex].parentIndex = i;
        }
      }
    }

    // Default to load root
    if (sectorRoot.facesFile.fileName) {
      this.setSectorLod(sectorRoot.id, LevelOfDetail.Simple);
    }
  }

  determineWantedSectorCount(): number {
    return this.sectors.reduce((count, x) => {
      count = x.lod !== LevelOfDetail.Discarded ? count + 1 : count;
      return count;
    }, 0);
  }

  toWantedSectors(
    modelIdentifier: string,
    modelBaseUrl: string,
    geometryClipBox: THREE.Box3 | null
  ): PrioritizedWantedSector[] {
    return this.sectors
      .filter(x => x !== undefined)
      .map(sector => {
        const wanted: PrioritizedWantedSector = {
          modelIdentifier,
          modelBaseUrl,
          levelOfDetail: sector.lod,
          metadata: sector.sector,
          priority: sector.priority,
          geometryClipBox
        };
        return wanted;
      })
      .sort((l, r) => r.priority - l.priority);
  }

  markSectorDetailed(sectorId: number, priority: number): void {
    this.setSectorPriority(sectorId, priority);
    if (this.sectors[sectorId].lod === LevelOfDetail.Detailed) {
      return;
    }
    let sectorContainer = this.sectors[sectorId];
    while (true) {
      switch (sectorContainer.lod) {
        case LevelOfDetail.Simple:
          this.replaceSimpleWithDetailed(sectorContainer.sector.id);
          break;
        case LevelOfDetail.Discarded:
          this.setSectorLod(sectorContainer.sector.id, LevelOfDetail.Detailed);
          break;
        default:
        // Already detailed
      }

      // More parents?
      if (sectorContainer.parentIndex === -1) break;
      sectorContainer = this.sectors[sectorContainer.parentIndex];
    }

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
        if ((child as V8SectorMetadata).facesFile.fileName !== null) {
          this.setSectorLod(child.id, LevelOfDetail.Simple);
        }
      }
    }
  }

  private setSectorLod(sectorId: number, lod: LevelOfDetail) {
    assert(lod !== LevelOfDetail.Simple || this.sectors[sectorId].sector.facesFile.fileName !== null);
    this.sectors[sectorId].lod = lod;
    reduceSectorCost(this._totalCost, this.sectors[sectorId].cost);
    this.sectors[sectorId].cost = this.determineSectorCost(this.sectors[sectorId].sector, lod);
    addSectorCost(this._totalCost, this.sectors[sectorId].cost);
  }

  private setSectorPriority(sectorId: number, priority: number) {
    this.sectors[sectorId].priority = priority;
  }

  private getSectorLod(sectorId: number): LevelOfDetail {
    return this.sectors[sectorId].lod;
  }
}

function assert(condition: boolean, message: string = 'assertion hit') {
  if (!condition) {
    log.error('[ASSERT]', message);
  }
}
