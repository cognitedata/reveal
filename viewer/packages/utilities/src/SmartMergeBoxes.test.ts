/*!
 * Copyright 2021 Cognite AS
 */
import { Box3, Vector3 } from 'three';
// import { SmartMergeBoxes } from './SmartMergeBoxes';
import { RTreeMergeBoxes } from './RTreeMergeBoxes';

describe('SmartMergeBoxes', () => {
  /* test('add non-intersecting bboxes',  () => {
    const mergeBoxes = new SmartMergeBoxes();
    
    const n = 10;
    const s = 10;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          const box = new Box3(new Vector3(i * s, j * s, k * s),
                               new Vector3(i * s + s - 1, j * s + s - 1, k * s + s - 1));
          mergeBoxes.addBoxes([box]);
        }
      }
    }

    const result = mergeBoxes.squashAndGetBoxes();
    
    expect(result.length == n * n * n);
  });


  test('add intersecting bboxes', () => {
    const mergeBoxes = new SmartMergeBoxes();
    
    const boxes: Box3[] = [];

    const n = 100;
    const s = 10;
    
    for (let i = 0; i < n; i++) {
      const box = new Box3(new Vector3(0, 0, i * s),
                           new Vector3(1, 1, i * (s + 1)));
      boxes.push(box);
    }

    // Scramble the boxes
    for (let i = 0; i < boxes.length; i++) {
      const num = Math.floor(Math.random() * (boxes.length - i)) + i;
      const temp = boxes[num];
      boxes[num] = boxes[i];
      boxes[i] = temp;
    }

    mergeBoxes.addBoxes(boxes);
    const result = mergeBoxes.squashAndGetBoxes();

    expect(result.length == 1);
    }); */

  test('add bounding boxes and check that result contains them', () => {
    const mergeBoxes = new RTreeMergeBoxes();

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

      boxes.push(new Box3(new Vector3(sx, sy, sz), new Vector3(dx, dy, dz)));
    }

    mergeBoxes.addBoxes(boxes);

    const mergedBoxes = mergeBoxes.getBoxes();

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
