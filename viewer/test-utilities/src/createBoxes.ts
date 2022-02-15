/*!
 * Copyright 2021 Cognite AS
 */

import { Box3, Vector3 } from 'three';
import * as SeededRandom from 'random-seed';

export function scrambleBoxes(boxes: Box3[], rand: SeededRandom.RandomSeed): void {
  for (let i = 0; i < boxes.length; i++) {
    const num = Math.floor(rand.random() * (boxes.length - i)) + i;
    const temp = boxes[num];
    boxes[num] = boxes[i];
    boxes[i] = temp;
  }
}

export function createRandomBoxes(n: number, maxDim: number, maxPos: number, rand: SeededRandom.RandomSeed): Box3[] {
  const boxes: Box3[] = [];
  for (let i = 0; i < n; i++) {
    const sx = rand.random() * maxPos;
    const sy = rand.random() * maxPos;
    const sz = rand.random() * maxPos;

    const dx = rand.random() * maxDim;
    const dy = rand.random() * maxDim;
    const dz = rand.random() * maxDim;

    const box = new Box3(new Vector3(sx, sy, sz), new Vector3(sx + dx, sy + dy, sz + dz));
    boxes.push(box);
  }

  return boxes;
}

export function createNonTouchingBoxesInRegularGrid(numberInEachDirection: number, size: number): Box3[] {
  const boxes: Box3[] = [];

  for (let i = 0; i < numberInEachDirection; i++) {
    for (let j = 0; j < numberInEachDirection; j++) {
      for (let k = 0; k < numberInEachDirection; k++) {
        const box = new Box3(
          new Vector3(i * (size + 1), j * (size + 1), k * (size + 1)),
          new Vector3(i * size + size, j * size + size, k * size + size)
        );

        boxes.push(box);
      }
    }
  }

  return boxes;
}

export function createOverlappingBoxes(n: number, size: number): Box3[] {
  const boxes: Box3[] = [];

  for (let i = 0; i < n; i++) {
    const box = new Box3(new Vector3(0, 0, i * size), new Vector3(1, 1, i * (size + 1)));
    boxes.push(box);
  }

  return boxes;
}
