/*!
 * Copyright 2021 Cognite AS
 */
import { SmartMergeBoxes } from './SmartMergeBoxes';
import { Box3 } from 'three';
import {
  createNonTouchingBoxesInRegularGrid,
  createOverlappingBoxes,
  createRandomBoxes,
  scrambleBoxes
} from '../../../../../test-utilities/src/createBoxes';

import * as SeededRandom from 'random-seed';

describe('SmartMergeBoxes', () => {
  test('add non-intersecting bboxes', () => {
    const mergeBoxes = new SmartMergeBoxes();

    const numberInEachDirection = 10;
    const size = 10;
    const boxes = createNonTouchingBoxesInRegularGrid(numberInEachDirection, size);

    mergeBoxes.addBoxes(boxes);
    const result = mergeBoxes.getBoxes();

    expect([...result].length === Math.pow(numberInEachDirection, 3));
  });

  test('add intersecting bboxes', () => {
    const rand = SeededRandom.create('someseed');

    const mergeBoxes = new SmartMergeBoxes();

    const n = 100;
    const s = 10;

    const boxes = createOverlappingBoxes(n, s);

    scrambleBoxes(boxes, rand);

    mergeBoxes.addBoxes(boxes);
    const result = mergeBoxes.getBoxes();

    expect([...result].length === 1);
  });

  test('union of two trees contains all inserted boxes', () => {
    const random = SeededRandom.create('someseed');

    const smartBoxes0 = new SmartMergeBoxes();
    const smartBoxes1 = new SmartMergeBoxes();

    const n = 500;
    const d = 10;
    const ms = 100;

    const boxes0 = createRandomBoxes(n, d, ms, random);
    const boxes1 = createRandomBoxes(n, d, ms, random);

    smartBoxes0.addBoxes(boxes0);
    smartBoxes1.addBoxes(boxes1);

    const union = smartBoxes0.union(smartBoxes1.getBoxes());

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
    const random = SeededRandom.create('someseed');

    const smartBoxes0 = new SmartMergeBoxes();
    const smartBoxes1 = new SmartMergeBoxes();

    const n = 500;
    const d = 10;
    const ms = 100;

    const boxes0 = createRandomBoxes(n, d, ms, random);
    const boxes1 = createRandomBoxes(n, d, ms, random);

    smartBoxes0.addBoxes(boxes0);
    smartBoxes1.addBoxes(boxes1);

    const intersection = smartBoxes0.intersection(smartBoxes1.getBoxes());

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
