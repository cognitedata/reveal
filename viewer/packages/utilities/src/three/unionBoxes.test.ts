/*!
 * Copyright 2022 Cognite AS
 */

import { createRandomBox } from '../../../../test-utilities/src/createBoxes';

import * as SeededRandom from 'random-seed';
import { unionBoxes } from './unionBoxes';

import * as THREE from 'three';

describe('computeSceneBoundingBox', () => {
  let boxes: THREE.Box3[];

  beforeEach(() => {
    const rand = SeededRandom.create('some_seed');

    const numSectors = 30;
    boxes = new Array<THREE.Box3>(numSectors);

    for (let i = 0; i < numSectors; i++) {
      const box: THREE.Box3 = createRandomBox(20, 100, rand);
      boxes[i] = box;
    }
  });

  test('returns box that contains all sectors in scene', () => {
    const fullBoundingBox = unionBoxes(boxes);

    expect(boxes.length).toBeGreaterThan(0);

    for (const box of boxes) {
      expect(fullBoundingBox.containsBox(box)).toBeTrue();
    }
  });

  test('returned box does not contain a point outside of model', () => {
    const fullBoundingBox = unionBoxes(boxes);

    let maxX = -Infinity;

    for (const box of boxes) {
      maxX = Math.max(maxX, box.max.x);
    }

    const boxOutside = new THREE.Box3(new THREE.Vector3(maxX, 0, 0), new THREE.Vector3(maxX + 1, 1, 1));

    expect(fullBoundingBox.containsBox(boxOutside)).toBeFalse();
  });
});
