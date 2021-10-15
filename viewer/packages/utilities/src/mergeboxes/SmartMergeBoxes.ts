/*!
 * Copyright 2021 Cognite AS
 */

import { Box3 } from 'three';
import { BoxClusterer } from './BoxClustererBase';
import { intersectionOverUnion } from './MergingRTree';

/**
 * SmartMergeBoxes - takes in batches of bounding boxes and
 * clusters them together in larger bounding boxes. The union of the larger
 * boxes contains all boxes that have been inserted
 */
export class SmartMergeBoxes implements BoxClusterer {
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

  private shouldMergeBoxesAtIndices(i: number, j: number): boolean {
    const BOX_MERGE_MIN_IOU = 0.15;
    const overlap = intersectionOverUnion(this.resultBoxes[i], this.resultBoxes[j]);
    return overlap >= BOX_MERGE_MIN_IOU;
  }

  private addBox(box: Box3): void {
    let merged = false;

    for (const resultBox of this.resultBoxes) {
      if (!box.intersectsBox(resultBox)) {
        continue;
      }

      resultBox.union(box);

      merged = true;
      break;
    }

    if (!merged) {
      this.resultBoxes.push(box.clone());
    }

    this.addedSinceSquash += 1;
  }
  
  addBoxes(boxes: Iterable<Box3>): void {
    for (const box of boxes) {
      this.addBox(box)
    }
  }

  squashBoxes(): void {
    for (let i = 0; i < this.resultBoxes.length; i++) {
      for (let j = i + 1; j < this.resultBoxes.length; j++) {
        const shouldMerge = this.shouldMergeBoxesAtIndices(i, j);
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

  union(other: BoxClusterer): BoxClusterer {
    if (!(other instanceof SmartMergeBoxes)) {
      throw Error('Expected SmartMergeBoxes in union operation');
    }

    const resClone = [];
    for (const resBox of this.resultBoxes) {
      resClone.push(resBox.clone());
    }

    const newSMB = new SmartMergeBoxes(resClone);

    const otherBoxes = other.getBoxes();
    newSMB.addBoxes(otherBoxes);

    return newSMB;
  }

  private addIntersectionIfNonempty(box0: Box3, box1: Box3, result: Box3[]): void {
    const inter = box0.clone().intersect(box1);
    if (!inter.isEmpty()) {
      result.push(inter);
    }
  }

  intersection(other: BoxClusterer): BoxClusterer {
    if (!(other instanceof SmartMergeBoxes)) {
      throw Error('Expected SmartMergeBoxes in intersection operation');
    }

    const otherBoxes = [...other.getBoxes()];
    const thisBoxes = this.resultBoxes;

    const newResultBoxes: Box3[] = [];

    for (const box0 of thisBoxes) {
      for (const box1 of otherBoxes) {
        this.addIntersectionIfNonempty(box0, box1, newResultBoxes);
      }
    }

    const newSMB = new SmartMergeBoxes(newResultBoxes);
    newSMB.squashBoxes();
    return newSMB;
  }
}
