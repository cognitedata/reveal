/*!
 * Copyright 2021 Cognite AS
 */

import { Box3, Vector3 } from 'three';

/**
 * SmartMergeBoxes - takes in batches of bounding boxes and
 * clusters them together in larger bounding boxes. The union of the larger
 * boxes contains all boxes that have been inserted
 */
export class BoxClusterer {
  private readonly resultBoxes: Box3[];
  private addedSinceSquash: number = 0;

  constructor();
  constructor(boxes: Box3[]);
  constructor(boxes?: Box3[]) {
    this.resultBoxes = boxes ?? [];
  }

  private mergeBoxesAtIndices(mini: number, maxi: number): void {
    this.resultBoxes[mini].union(this.resultBoxes[maxi]);

    // Remove resultBoxes[maxi], replace by last box in list
    this.resultBoxes[maxi] = this.resultBoxes[this.resultBoxes.length - 1];
    this.resultBoxes.pop();
  }

  private readonly _surfaceAreaVars = {
    size: new Vector3()
  };

  private surfaceArea(box: Box3) {
    const { size } = this._surfaceAreaVars;
    box.getSize(size);

    return 2 * (size.x * size.y + size.y * size.z + size.z * size.x);
  }

  private readonly _shouldMergeBoxesVars = {
    inputBox: new Box3()
  };

  private shouldMergeBoxes(box0: Box3, box1: Box3): boolean {
    const MAX_SURFACE_INCREASE_RATIO = 1.0;
    const MAX_SURFACE_INCREASE_ADDITIVE_TERM = 8.0; // Heuristic number of square meters to allow merging of smaller boxes

    const { inputBox } = this._shouldMergeBoxesVars;
    inputBox.copy(box0);
    const union = inputBox.union(box1);

    const unionSurfaceArea = this.surfaceArea(union);
    const originalSurfaceArea = this.surfaceArea(box0);
    const otherBoxSurfaceArea = this.surfaceArea(box1);

    return (
      unionSurfaceArea <
      MAX_SURFACE_INCREASE_RATIO * (originalSurfaceArea + otherBoxSurfaceArea) + MAX_SURFACE_INCREASE_ADDITIVE_TERM
    );
  }

  private addBox(box: Box3): void {
    let merged = false;

    for (let i = 0; i < this.resultBoxes.length; i++) {
      if (!this.shouldMergeBoxes(box, this.resultBoxes[i])) {
        continue;
      }
      this.resultBoxes[i].union(box);

      merged = true;
      break;
    }

    if (!merged) {
      this.resultBoxes.push(box.clone());
    }

    this.addedSinceSquash += 1;
  }

  get boxCount(): number {
    return this.resultBoxes.length;
  }

  addBoxes(boxes: Iterable<Box3>): void {
    for (const box of boxes) {
      this.addBox(box);
    }
  }

  squashBoxes(): void {
    for (let i = 0; i < this.resultBoxes.length; i++) {
      for (let j = i + 1; j < this.resultBoxes.length; j++) {
        const shouldMerge = this.shouldMergeBoxes(this.resultBoxes[i], this.resultBoxes[j]);
        if (shouldMerge) {
          this.mergeBoxesAtIndices(i, j);

          // Decrement to iterate again on index j, as it has changed
          j--;
        }
      }
    }
  }

  *getBoxes(): Generator<Box3> {
    // Squash if number of boxes has grown by at least this ratio since last squash
    const GROWTH_RATIO_BEFORE_SQUASH = 0.3;

    if (this.addedSinceSquash > GROWTH_RATIO_BEFORE_SQUASH * this.resultBoxes.length) {
      this.squashBoxes();
      this.addedSinceSquash = 0;
    }

    for (const box of this.resultBoxes) {
      yield box.clone();
    }
  }

  intersectsBox(box: Box3): boolean {
    for (const internalBox of this.resultBoxes) {
      if (box.intersectsBox(internalBox)) {
        return true;
      }
    }

    return false;
  }

  union(boxes: Iterable<Box3>): BoxClusterer {
    const resClone = [];
    for (const resBox of this.resultBoxes) {
      resClone.push(resBox.clone());
    }

    const newSMB = new BoxClusterer(resClone);

    newSMB.addBoxes(boxes);

    return newSMB;
  }

  private addIntersectionIfNonempty(box0: Box3, box1: Box3, result: Box3[]): void {
    const inter = box0.clone().intersect(box1);
    if (!inter.isEmpty()) {
      result.push(inter);
    }
  }

  intersection(other: Iterable<Box3>): BoxClusterer {
    const otherBoxes = [...other];
    const thisBoxes = this.resultBoxes;

    const newResultBoxes: Box3[] = [];

    for (const box0 of thisBoxes) {
      for (const box1 of otherBoxes) {
        this.addIntersectionIfNonempty(box0, box1, newResultBoxes);
      }
    }

    const newSMB = new BoxClusterer(newResultBoxes);
    newSMB.squashBoxes();
    return newSMB;
  }
}
