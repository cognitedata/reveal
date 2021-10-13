/*!
 * Copyright 2021 Cognite AS
 */
import { SmartMergeBoxes } from './SmartMergeBoxes';
import { Box3, Vector3 } from 'three';

describe('SmartMergeBoxes', () => {
  function createRandomBoxes(n: number, maxDim: number, maxPos: number): Box3[] {
    const boxes: Box3[] = [];
    for (let i = 0; i < n; i++) {
      const sx = Math.random() * maxPos;
      const sy = Math.random() * maxPos;
      const sz = Math.random() * maxPos;

      const dx = Math.random() * maxDim;
      const dy = Math.random() * maxDim;
      const dz = Math.random() * maxDim;

      const box = new Box3(new Vector3(sx, sy, sz), new Vector3(sx + dx, sy + dy, sz + dz));
      boxes.push(box);
    }

    return boxes;
  }

  test('add non-intersecting bboxes', () => {
    const mergeBoxes = new SmartMergeBoxes();

    const boxes: Box3[] = [];

    const n = 10;
    const s = 10;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) {
          const box = new Box3(
            new Vector3(i * s, j * s, k * s),
            new Vector3(i * s + s - 1, j * s + s - 1, k * s + s - 1)
          );

          boxes.push(box);
        }
      }
    }

    mergeBoxes.addBoxes(boxes);
    const result = mergeBoxes.getBoxes();

    expect([...result].length == n * n * n);
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
    const result = mergeBoxes.getBoxes();

    expect([...result].length == 1);
  });

  test('union of two trees contains all inserted boxes', () => {
    const smartBoxes0 = new SmartMergeBoxes();
    const smartBoxes1 = new SmartMergeBoxes();

    const n = 500;
    const d = 10;
    const ms = 100;

    const boxes0 = createRandomBoxes(n, d, ms);
    const boxes1 = createRandomBoxes(n, d, ms);

    smartBoxes0.addBoxes(boxes0);
    smartBoxes1.addBoxes(boxes1);

    const union = smartBoxes0.union(smartBoxes1);

    const unionBoxes = [...union.getBoxes()];

    const allBoxes = [...boxes0, ...boxes1];

    for (const box of allBoxes) {
      let isInUnion = false;
      for (const unionBox of unionBoxes) {
        if (unionBox.containsBox(box)) {
          isInUnion = true;
          break;
        }
      }

      expect(isInUnion).toEqual(true);
    }
  });

  test('intersection of two trees contains intersection between all boxes', () => {
    const smartBoxes0 = new SmartMergeBoxes();
    const smartBoxes1 = new SmartMergeBoxes();

    const n = 500;
    const d = 10;
    const ms = 100;

    const boxes0 = createRandomBoxes(n, d, ms);
    const boxes1 = createRandomBoxes(n, d, ms);

    smartBoxes0.addBoxes(boxes0);
    smartBoxes1.addBoxes(boxes1);

    const intersection = smartBoxes0.intersection(smartBoxes1);

    const treeIntersectionBoxes = [...intersection.getBoxes()];

    const allIntersectionBoxes: Box3[] = [];

    for (const box0 of boxes0) {
      for (const box1 of boxes1) {
        const boxIntersection = box0.clone().intersect(box1);
        if (!boxIntersection.isEmpty()) {
          allIntersectionBoxes.push(boxIntersection);
        }
      }
    }

    for (const box of allIntersectionBoxes) {
      let isInIntersection = false;
      for (const treeIntersectionBox of treeIntersectionBoxes) {
        if (treeIntersectionBox.containsBox(box)) {
          isInIntersection = true;
          break;
        }
      }

      expect(isInIntersection).toEqual(true);
    }
  });
});
