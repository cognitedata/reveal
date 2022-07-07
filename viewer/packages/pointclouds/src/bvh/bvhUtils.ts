/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { BvhElement } from './BvhElement';

import { unionBoxes } from '@reveal/utilities';

const computeVectorSeparatismVars = { vec: new THREE.Vector3() };

function computeVectorSeparatism(min: THREE.Vector3, max: THREE.Vector3): number {
  const { vec: diff } = computeVectorSeparatismVars;

  diff.copy(min).sub(max);

  return Math.max(diff.x, Math.max(diff.y, diff.z));

}

/**
 * Computes "separatism" - the degree to which the boxes are separated (will be negative if boxes are intersecting)
 */
function computeBoxSeparatism(a: THREE.Box3, b: THREE.Box3): number {
  return Math.max(computeVectorSeparatism(a.min, b.max), computeVectorSeparatism(b.min, a.max));
}

/**
 * Simple box sorting function that just sorts the boxes by their value in their
 * `axisIndex` component of the `min` vector
 */
function elementAxisCompare(e0: BvhElement, e1: BvhElement, axisIndex: number): number {
  return e0.getBox().min.getComponent(axisIndex) - e1.getBox().min.getComponent(axisIndex);
}

function copySortedByAxis<T extends BvhElement>(elements: T[], axisIndex: number): T[] {
  const elementsCopy = elements.slice();
  elementsCopy.sort((e0, e1) => elementAxisCompare(e0, e1, axisIndex));
  return elementsCopy;
}

function splitByMiddle<T>(elements: T[]): [T[], T[]] {
  const midIndex = Math.floor(elements.length / 2);
  return [ elements.slice(0, midIndex), elements.slice(midIndex, elements.length) ];
}

/**
 * Returns how well sorting the `elements` along the specified axis "separates" the
 * bounding boxes of the two halves of the list. A good separation heuristically means
 * it's a good sorting for splitting the elements at a BVH node
 */
function evaluateSeparatingAxis(elements: BvhElement[], axisIndex: number): number {
  if (elements.length < 2) {
    throw Error("Too few elements provided to separation evaluation function, need at least two");
  }

  const sortedElements = copySortedByAxis(elements, axisIndex);
  const boxes = sortedElements.map(e => e.getBox());

  const [firstBoxes, lastBoxes] = splitByMiddle(boxes);

  const box0 = unionBoxes(firstBoxes);
  const box1 = unionBoxes(lastBoxes);

  return computeBoxSeparatism(box0, box1);
}

/**
 * Splits the list into two (somewhat) equally sized parts which is deemed to best
 * separates the boxes associated with the elements
 */
export function findBestSplit<T extends BvhElement>(elements: T[]): [T[], T[]] {
    let bestSeparatism = -Infinity, bestAxisIndex = 0;

    for (let i = 0; i < 3; i++) {
      const separatismValue = evaluateSeparatingAxis(elements, i);

      if (separatismValue > bestSeparatism) {
        bestAxisIndex = i;
        bestSeparatism = separatismValue;
      }
    }

    const sortedElements = copySortedByAxis(elements, bestAxisIndex);
    return splitByMiddle(sortedElements);
}
