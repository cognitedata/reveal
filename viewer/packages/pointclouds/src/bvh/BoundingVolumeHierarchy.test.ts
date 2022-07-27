/*!
 * Copyright 2022 Cognite AS
 */

import { BoundingVolumeHierarchy } from './BoundingVolumeHierarchy';
import { BvhElement } from './BvhElement';

import * as SeededRandom from 'random-seed';

import * as THREE from 'three';

const random = SeededRandom.create('someseed');

class BasicBvhElement implements BvhElement {
  constructor(private _box: THREE.Box3,
              private _id: number) { }

  getBox(): THREE.Box3 {
    return this._box;
  }

  getId() {
    return this._id;
  }
};

function createId() {
  return Math.floor(random.random() * 100000);
}

function createBoxes(): BasicBvhElement[] {
  return new Array<number>(100).fill(0).map(_ => {
    const min = new THREE.Vector3(random.random(), random.random(), random.random()).multiplyScalar(100);
    const span = new THREE.Vector3(random.random(), random.random(), random.random()).multiplyScalar(50);
    const box = new THREE.Box3(min, min.clone().add(span));

    return new BasicBvhElement(box, createId());
  });
}

function createPoints(): THREE.Vector3[] {
  return new Array<number>(20).fill(0).map(_ => {
    return new THREE.Vector3(random.random(), random.random(), random.random()).multiplyScalar(120);
  });
}

describe(BoundingVolumeHierarchy.name, () => {
  test('finds all intersecting elements for query points', () => {
    const boxes = createBoxes();
    const bvh = new BoundingVolumeHierarchy(boxes);
    const points = createPoints();

    let numBoxesFound = 0;

    for (const point of points) {
      const expectedBoxIds: number[] = []

      for (const box of boxes) {
        if (box.getBox().containsPoint(point)) {
          expectedBoxIds.push(box.getId());
        }
      }

      const newBoxIds = bvh.findContainingElements(point).map(b => b.getId());

      newBoxIds.sort();
      expectedBoxIds.sort();

      expect(newBoxIds).toEqual(expectedBoxIds);
      numBoxesFound += newBoxIds.length;
    }

    console.log('num boxes = ', numBoxesFound);
    expect(numBoxesFound).toBePositive();
  });
});
