/*!
 * Copyright 2020 Cognite AS
 */
import { NumericRange } from '@/utilities';

/**
 * Helper class that schedules node apperance update to avoid
 * node apperance being updated unnecessary much.
 */
export class NodeStyleUpdater {
  private readonly updateNodesApperanceCb: (treeIndices: number[]) => void;
  private readonly toBeUpdatedTreeIndices: Set<number> = new Set();
  private updateHandle: ReturnType<typeof setTimeout> | undefined;

  constructor(updateNodesApperanceCb: (treeIndices: number[]) => void) {
    this.updateNodesApperanceCb = updateNodesApperanceCb;
  }

  /**
   * Notify the updater that the apperance for given tree index range needs to be updated.
   * @param treeIndices
   */
  triggerUpdateRange(treeIndices: NumericRange): void {
    const sizeBefore = this.toBeUpdatedTreeIndices.size;
    for (let idx = treeIndices.from; idx <= treeIndices.toInclusive; idx++) {
      this.toBeUpdatedTreeIndices.add(idx);
    }
    if (this.toBeUpdatedTreeIndices.size > sizeBefore) {
      this.scheduleUpdate();
    }
  }

  /**
   * Notify the updater that the apperance for the given tree indices given needs to be updated.
   * @param treeIndices
   */
  triggerUpdateArray(treeIndices: number[]): void {
    const sizeBefore = this.toBeUpdatedTreeIndices.size;
    for (let i = 0; i < treeIndices.length; i++) {
      this.toBeUpdatedTreeIndices.add(treeIndices[i]);
    }
    if (this.toBeUpdatedTreeIndices.size > sizeBefore) {
      this.scheduleUpdate();
    }
  }

  /**
   * Notify the updater that the apperance for the given tree index given needs to be updated.
   * @param treeIndex
   */
  triggerUpdateSingle(treeIndex: number): void {
    const sizeBefore = this.toBeUpdatedTreeIndices.size;
    this.toBeUpdatedTreeIndices.add(treeIndex);
    if (this.toBeUpdatedTreeIndices.size > sizeBefore) {
      this.scheduleUpdate();
    }
  }

  /** @private */
  private scheduleUpdate() {
    if (this.updateHandle === undefined) {
      this.updateHandle = setTimeout(() => {
        const treeIndices = Array.from(this.toBeUpdatedTreeIndices);
        treeIndices.sort((a, b) => a - b);
        this.toBeUpdatedTreeIndices.clear();
        this.updateNodesApperanceCb(treeIndices);
        this.updateHandle = undefined;
      }, 0);
    }
  }
}
