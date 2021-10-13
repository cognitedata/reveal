/*!
 * Copyright 2021 Cognite AS
 */

import { Box3 } from 'three';
import { BoxClustererBase } from './BoxClustererBase';
import { intersectionOverUnion } from './MergingRTree';

/**
 * SmartMergeBoxes - takes in batches of bounding boxes and
 * clusters them together in larger bounding boxes. The union of the larger
 * boxes contains all boxes that have been inserted
 */
export class SmartMergeBoxes implements BoxClustererBase<SmartMergeBoxes> {
  private readonly resultBoxes: Box3[] = [];
  private addedSinceSquash: number = 0;

  constructor();
  constructor(boxes: Box3[]);
  constructor(boxes: Box3[] | undefined = undefined) {
    if (boxes) {
      this.resultBoxes = boxes;
    }
  }

  addBoxes(boxes: Box3[]): void {
    for (const box of boxes) {
      let merged = false;

      for (let i = 0; i < this.resultBoxes.length; i++) {
        if (box.intersectsBox(this.resultBoxes[i])) {
          this.resultBoxes[i].union(box);

          merged = true;
          break;
        }
      }

      if (!merged) {
        this.resultBoxes.push(box.clone());
      }
    }

    this.addedSinceSquash += boxes.length;
  }

  squashBoxes(): void {
    const BOX_MERGE_MIN_IOU = 0.15;

    for (let i = 0; i < this.resultBoxes.length; i++) {
      for (let j = i + 1; j < this.resultBoxes.length; j++) {
        const overlap = intersectionOverUnion(this.resultBoxes[i], this.resultBoxes[j]);
        if (overlap >= BOX_MERGE_MIN_IOU) {
          this.resultBoxes[i].union(this.resultBoxes[j]);

          // Remove resultBoxes[j], replace by last box in list
          this.resultBoxes[j] = this.resultBoxes[this.resultBoxes.length - 1];
          this.resultBoxes.pop();
        }
      }
    }
  }

  getBoxes(): Box3[] {
    if (this.addedSinceSquash > 0.3 * this.resultBoxes.length) {
      this.squashBoxes();
      this.addedSinceSquash = 0;
    }

    return this.resultBoxes;
  }

  union(other: BoxClustererBase<SmartMergeBoxes>): BoxClustererBase<SmartMergeBoxes> {
    const resClone = [];
    for (const resBox of this.resultBoxes) {
      resClone.push(resBox.clone());
    }

    const newSMB = new SmartMergeBoxes(resClone);

    const otherBoxes = other.getBoxes();
    newSMB.addBoxes(otherBoxes);

    return newSMB;
  }

  intersection(other: BoxClustererBase<SmartMergeBoxes>): BoxClustererBase<SmartMergeBoxes> {
    const otherBoxes = other.getBoxes();
    const thisBoxes = this.resultBoxes;

    const newResultBoxes: Box3[] = [];

    for (const box0 of thisBoxes) {
      for (const box1 of otherBoxes) {
        const inter = box0.clone().intersect(box1);
        if (!inter.isEmpty()) {
          newResultBoxes.push(inter);
        }
      }
    }

    const newSMB = new SmartMergeBoxes(newResultBoxes);
    newSMB.squashBoxes();
    return newSMB;
  }

  getValue() {
    return this;
  }
}
