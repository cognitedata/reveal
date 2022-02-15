/*!
 * Copyright 2021 Cognite AS
 */

import { ClusteredAreaCollection } from './ClusteredAreaCollection';

import { createRandomBoxes } from '../../../../test-utilities/src/createBoxes';

import * as SeededRandom from 'random-seed';

import * as THREE from 'three';

describe('ClusteredAreaCollection', () => {
  test('empty set is empty', () => {
    const areaCollection = new ClusteredAreaCollection();

    expect(areaCollection.isEmpty).toBeTrue();

    areaCollection.addAreas([new THREE.Box3().setFromArray([1, 2, 3, 4, 5, 6])]);

    expect(areaCollection.isEmpty).toBeFalse();
  });

  test('does not store just one box and not every box either', () => {
    // NB: For some (rare) choice of random boxes, this will fail. Choose
    // new seed if that happens

    const rand = SeededRandom.create('someseed');

    const boxes = createRandomBoxes(100, 10, 30, rand);

    const areaCollection = new ClusteredAreaCollection();
    areaCollection.addAreas(boxes);

    const clusteredAreas = [...areaCollection.areas()];

    expect(clusteredAreas.length).toBeGreaterThan(1);
    expect(clusteredAreas.length).toBeLessThan(boxes.length);
  });

  test('intersects all inserted areas', () => {
    const rand = SeededRandom.create('someseed');
    const boxes = createRandomBoxes(100, 10, 30, rand);

    const areaCollection = new ClusteredAreaCollection();
    areaCollection.addAreas(boxes);

    for (const box of boxes) {
      expect(areaCollection.intersectsBox(box)).toBeTrue();
    }
  });

  test('intersects all inserted areas', () => {
    const rand = SeededRandom.create('someseed');
    const boxes = createRandomBoxes(100, 10, 30, rand);

    const areaCollection = new ClusteredAreaCollection();
    areaCollection.addAreas(boxes);

    for (const box of boxes) {
      expect(areaCollection.intersectsBox(box)).toBeTrue();
    }
  });

  test('intersectWith contains intersection of two box sets', () => {
    const rand = SeededRandom.create();

    const boxes0 = createRandomBoxes(50, 10, 30, rand);
    const boxes1 = createRandomBoxes(50, 10, 30, rand);

    const areaCollection0 = new ClusteredAreaCollection();
    const areaCollection1 = new ClusteredAreaCollection();

    areaCollection0.addAreas(boxes0);
    areaCollection1.addAreas(boxes1);

    areaCollection0.intersectWith(areaCollection1.areas());

    // Find all non-empty intersections between the two
    const intersections = boxes0.flatMap(box0 =>
      boxes1.map(box1 => box1.clone().intersect(box0)).filter(intersection => intersection)
    );

    for (const intersection of intersections) {
      let containedInSomeArea = false;
      for (const area of areaCollection0.areas()) {
        if (area.containsBox(intersection)) {
          containedInSomeArea = true;
          break;
        }
      }

      expect(containedInSomeArea).toBeTrue();
    }
  });
});
