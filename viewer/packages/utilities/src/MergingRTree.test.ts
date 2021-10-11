/*!
 * Copyright 2021 Cognite AS
 */

import { MergingRTree } from './MergingRTree';
import { Box3, Vector3 } from 'three';

describe('RTree', () => {
  test('add bounding boxes and check that result contains them', () => {
    const rtree = new MergingRTree();

    const n = 1000;
    const d = 10; // Max size for each box, in each dimension
    const ms = 100; // Max min value for each box, in each dimension

    const boxes: Box3[] = [];

    for (let i = 0; i < n; i++) {
      const sx = Math.random() * ms;
      const sy = Math.random() * ms;
      const sz = Math.random() * ms;

      const dx = Math.random() * d;
      const dy = Math.random() * d;
      const dz = Math.random() * d;

      const box = new Box3(new Vector3(sx, sy, sz), new Vector3(dx, dy, dz));
      boxes.push(box);
      rtree.insert(box);
    }

    const mergedBoxes = rtree.getBoxes();

    for (const box of boxes) {
      let isInMergedBoxes = false;
      for (const mergedBox of mergedBoxes) {
        if (mergedBox.containsBox(box)) {
          isInMergedBoxes = true;
          break;
        }
      }

      expect(isInMergedBoxes).toEqual(true);
    }
  });
});
