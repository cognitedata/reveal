/* eslint-disable header/header */

import { RevealGeometryCollectionType } from '@reveal/sector-parser';

export class TreeIndexToSectorsMap {
  private readonly treeIndexToSectorIds = new Map<number, Set<number>>();
  private readonly parsedSectors = new Map<number, Set<RevealGeometryCollectionType>>();

  set(treeIndex: number, sectorId: number): void {
    if (this.treeIndexToSectorIds.has(treeIndex)) {
      this.treeIndexToSectorIds.get(treeIndex)?.add(sectorId);
    } else {
      this.treeIndexToSectorIds.set(treeIndex, new Set<number>([sectorId]));
    }
  }

  get(treeIndex: number): Set<number> | undefined {
    return this.treeIndexToSectorIds.get(treeIndex);
  }

  isCompleted(sectorId: number, type: RevealGeometryCollectionType): boolean {
    const parsedTypes = this.parsedSectors.get(sectorId);
    if (parsedTypes !== undefined) {
      return parsedTypes.has(type);
    }
    return false;
  }

  markCompleted(sectorId: number, type: RevealGeometryCollectionType): void {
    if (this.parsedSectors.has(sectorId)) {
      this.parsedSectors.get(sectorId)?.add(sectorId);
    } else {
      this.parsedSectors.set(sectorId, new Set<number>([type]));
    }
  }
}
