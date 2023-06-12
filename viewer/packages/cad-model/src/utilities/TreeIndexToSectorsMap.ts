/*!
 * Copyright 2023 Cognite AS
 */

import { RevealGeometryCollectionType } from '@reveal/sector-parser';

/**
 * Map between a tree index and the set of sectors it has geometry in. Also contains helper functions keep track of whether or not
 * a given sector has already had all its tree indices added to the map. This means iterating over all tree indices in a sector
 * will only be done when said sector is loaded for the first time.
 */
export class TreeIndexToSectorsMap {
  public onChange?: (treeIndex: number, newSectorId: number) => void;
  private readonly treeIndexToSectorIds = new Map<number, Set<number>>();
  private readonly parsedSectors = new Map<number, Set<RevealGeometryCollectionType>>();

  /**
   * Store the fact that a tree index is found to have geometry in a certain sector
   * @param treeIndex Tree index
   * @param sectorId The sector id where the tree index was found
   */
  set(treeIndex: number, sectorId: number): void {
    const existingSet = this.treeIndexToSectorIds.get(treeIndex);
    if (existingSet) {
      if (!existingSet.has(sectorId)) {
        existingSet.add(sectorId);
        this.onChange?.(treeIndex, sectorId);
      }
    } else {
      this.treeIndexToSectorIds.set(treeIndex, new Set<number>([sectorId]));
      this.onChange?.(treeIndex, sectorId);
    }
  }

  /**
   * Get the set of sectors a given tree index is known to have geometry in
   * @param treeIndex Tree index
   * @returns The set of sectors
   */
  get(treeIndex: number): Set<number> {
    return this.treeIndexToSectorIds.get(treeIndex) ?? new Set<number>();
  }

  /**
   * Mark a sector as completed for a given geometry type. This will make subsequent calls to isCompleted
   * for this geometry type return true
   * @param sectorId The sector id
   * @param type The geometry type
   */
  markCompleted(sectorId: number, type: RevealGeometryCollectionType): void {
    const existingSet = this.parsedSectors.get(sectorId);
    if (existingSet) {
      existingSet.add(sectorId);
    } else {
      this.parsedSectors.set(sectorId, new Set<number>([type]));
    }
  }

  /**
   * Check whether or not a sector is completely processed, for a given geometry type
   * @param sectorId The sector id
   * @param type The geometry type
   * @returns True if completed, false otherwise
   */
  isCompleted(sectorId: number, type: RevealGeometryCollectionType): boolean {
    const parsedTypes = this.parsedSectors.get(sectorId);
    if (parsedTypes) {
      return parsedTypes.has(type);
    }
    return false;
  }
}
