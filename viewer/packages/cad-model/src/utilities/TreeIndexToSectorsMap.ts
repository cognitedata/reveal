/*!
 * Copyright 2023 Cognite AS
 */

import { RevealGeometryCollectionType } from '@reveal/sector-parser';

// todo: break into two classes? and keep the "isComplete" part closer to where it's used?

export class TreeIndexToSectorsMap {
  public onChange?: (treeIndex: number, newSectorId: number) => void;
  private readonly treeIndexToSectorIds = new Map<number, Set<number>>();
  private readonly parsedSectors = new Map<number, Set<RevealGeometryCollectionType>>();

  set(treeIndex: number, sectorId: number): void {
    const existingSet = this.treeIndexToSectorIds.get(treeIndex);
    if (existingSet && !existingSet.has(sectorId)) {
      // This tree index has not been seen in this sector before
      this.onChange?.(treeIndex, sectorId);
      existingSet.add(sectorId);
    } else {
      this.treeIndexToSectorIds.set(treeIndex, new Set<number>([sectorId]));
    }
  }

  get(treeIndex: number): Set<number> | undefined {
    return this.treeIndexToSectorIds.get(treeIndex);
  }

  isCompleted(sectorId: number, type: RevealGeometryCollectionType): boolean {
    const parsedTypes = this.parsedSectors.get(sectorId);
    if (parsedTypes) {
      return parsedTypes.has(type);
    }
    return false;
  }

  markCompleted(sectorId: number, type: RevealGeometryCollectionType): void {
    const existingSet = this.parsedSectors.get(sectorId);
    if (existingSet) {
      existingSet.add(sectorId);
    } else {
      this.parsedSectors.set(sectorId, new Set<number>([type]));
    }
  }
}
