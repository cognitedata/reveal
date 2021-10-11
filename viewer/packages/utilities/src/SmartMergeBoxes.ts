/*!
 * Copyright 2021 Cognite AS
 */

import { Box3 } from 'three';
import { iou } from './RTree';

const BOX_MERGE_MIN_IOU = 0.15;

export class SmartMergeBoxes {
  resultBoxes: Box3[] = [];

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
        this.resultBoxes.push(box);
      }
    }
  }

  squashBoxes(): void {
    for (let i = 0; i < this.resultBoxes.length; i++) {
      for (let j = i + 1; j < this.resultBoxes.length; j++) {
        const overlap = iou(this.resultBoxes[i], this.resultBoxes[j]);
        if (overlap >= BOX_MERGE_MIN_IOU) {
          this.resultBoxes[i].union(this.resultBoxes[j]);

          // Remove resultBoxes[j], replace by last box in list
          this.resultBoxes[j] = this.resultBoxes[this.resultBoxes.length - 1];
          this.resultBoxes.pop();
        }
      }
    }
  }

  squashAndGetBoxes(): Box3[] {
    this.squashBoxes();

    return this.resultBoxes;
  }
}
