/*!
 * Copyright 2021 Cognite AS
 */

import { Box3 } from 'three';

export class SmartMergeBoxes {
  resultBoxes: Box3[] = [];

  addBoxes(boxes: Box3[]): void {
    for (const box of boxes) {
      let merged = false;

      for (let i = 0; i < this.resultBoxes.length; i++) {
        if (box.intersectsBox(this.resultBoxes[i])) {
          this.resultBoxes[i] = this.resultBoxes[i].union(box);

          merged = true;
          break;
        }
      }

      if (!merged) {
        this.resultBoxes.push(box);
      }
    }
  }

  getBoxes(): Box3[] {
    return this.resultBoxes;
  }
}
