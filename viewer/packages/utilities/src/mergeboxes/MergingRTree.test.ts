/*!
 * Copyright 2021 Cognite AS
 */

import { MergingRTree } from './MergingRTree';
import { Box3, Vector3 } from 'three';

import * as SeededRandom from 'random-seed';

describe('RTree', () => {
  function createRandomBoxes(n: number, maxDim: number, maxPos: number, rand: SeededRandom.RandomSeed): Box3[] {
    const boxes: Box3[] = [];

    for (let i = 0; i < n; i++) {
      const sx = rand.random() * maxPos;
      const sy = rand.random() * maxPos;
      const sz = rand.random() * maxPos;

      const dx = rand.random() * maxDim;
      const dy = rand.random() * maxDim;
      const dz = rand.random() * maxDim;


      const minCorner= new Vector3(sx, sy, sz);
      const maxCorner = new Vector3(sx + dx, sy + dy, sz + dz);
      
      const box = new Box3(minCorner, maxCorner);
      boxes.push(box);
    }

    return boxes;
  }

  test('add bounding boxes and check that result contains them', () => {
    
    const random = SeededRandom.create('someseed');
    
    const rtree = new MergingRTree();

    const n = 1000;
    const d = 10; // Max size for each box, in each dimension
    const ms = 100; // Max min value for each box, in each dimension

    const boxes: Box3[] = createRandomBoxes(n, d, ms, random);

    for (const box of boxes) {
      rtree.insert(box);
    }

    const mergedBoxes = [...rtree.getBoxes()];

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

  test('union of two trees contains all inserted boxes', () => {
    
    const random = SeededRandom.create('someseed');
    
    const rtree0 = new MergingRTree();
    const rtree1 = new MergingRTree();

    const n = 500;
    const d = 10;
    const ms = 100;

    const boxes0: Box3[] = createRandomBoxes(n, d, ms, random);
    const boxes1: Box3[] = createRandomBoxes(n, d, ms, random);

    for (const box of boxes0) {
      rtree0.insert(box);
    }

    for (const box of boxes1) {
      rtree1.insert(box);
    }

    const unionTree = rtree0.union(rtree1);

    const unionBoxes = [...unionTree.getBoxes()];

    const allBoxes = boxes0.concat(boxes1);

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
    
    const rtree0 = new MergingRTree();
    const rtree1 = new MergingRTree();

    const n = 1000;
    const d = 10;
    const ms = 100;

    const boxes0: Box3[] = createRandomBoxes(n, d, ms, random);
    const boxes1: Box3[] = createRandomBoxes(n, d, ms, random);

    for (const box of boxes0) {
      rtree0.insert(box);
    }

    for (const box of boxes1) {
      rtree1.insert(box);
    }

    const intersection = rtree0.intersection(rtree1);

    // Make into list so we can iterate through it several times
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

  test('findOverlappingBoxes returns all overlapping boxes', () => {
    
    const random = SeededRandom.create('someseed');
    
    const rtree0 = new MergingRTree();

    const n = 1000;
    const d = 10;
    const ms = 100;

    const boxes0: Box3[] = createRandomBoxes(n, d, ms, random);

    const boxes1: Box3[] = createRandomBoxes(n, d, ms, random);

    for (const box of boxes0) {
      rtree0.insert(box);
    }

    const overlappingBoxes: Box3[][] = [];

    for (const box1 of boxes1) {
      const tempArray: Box3[] = [];
      for (const box0 of boxes0) {
        if (box1.intersectsBox(box0)) {
          tempArray.push(box0.clone());
        }
      }

      overlappingBoxes.push(tempArray);
    }

    for (let i = 0; i < boxes1.length; i++) {
      const foundOverlappingBoxes = rtree0.findOverlappingBoxes(boxes1[i]);
      for (const b0 of overlappingBoxes[i]) {
        let isInSomeBox = false;
        for (const b1 of foundOverlappingBoxes) {
          if (b1.containsBox(b0)) {
            isInSomeBox = true;
            break;
          }
        }

        expect(isInSomeBox).toEqual(true);
      }
    }
  });
});
