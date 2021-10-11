/*!
 * Copyright 2021 Cognite AS
 */
import { Box3, Vector3 } from 'three';
import { SmartMergeBoxes } from './SmartMergeBoxes';

describe('SmartMergeBoxes', () => {
  test('add non-intersecting bboxes', () => {
    const mergeBoxes = new SmartMergeBoxes();

    const n = 10;
    const s = 10;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          const box = new Box3(
            new Vector3(i * s, j * s, k * s),
            new Vector3(i * s + s - 1, j * s + s - 1, k * s + s - 1)
          );
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
      const box = new Box3(new Vector3(0, 0, i * s), new Vector3(1, 1, i * (s + 1)));
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
  });
});
