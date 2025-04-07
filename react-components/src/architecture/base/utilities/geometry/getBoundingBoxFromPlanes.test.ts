/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';

import { Box3, Vector3, Plane } from 'three';
import { isEntireBoxVisibleByPlanes, isPartOfBoxVisibleByPlanes } from './isBoxVisibleByPlanes';
import { getBoundingBoxFromPlanes } from './getBoundingBoxFromPlanes';

const min = new Vector3(100, 200, 300);
const max = new Vector3(400, 600, 800);
const box = new Box3(min, max);

describe('isBoxVisibleByPlanes', () => {
  test('should test with no planes', () => {
    const planes: Plane[] = [];

    getBoundingBoxFromPlanes;
    expect(isEntireBoxVisibleByPlanes(planes, box)).toBe(true);
    expect(isPartOfBoxVisibleByPlanes(planes, box)).toBe(true);
  });

  test('should test with visible planes only', () => {
    const planes = createSomePlanes(min, max, 1);
    expect(isEntireBoxVisibleByPlanes(planes, box)).toBe(true);
    expect(isPartOfBoxVisibleByPlanes(planes, box)).toBe(true);
  });

  test('should test with some or all invisible planes', () => {
    const planes = createSomePlanes(min, max, 1);
    for (let i = 0; i < planes.length; i++) {
      planes[i] = planes[i].negate();
      expect(isEntireBoxVisibleByPlanes(planes, box)).toBe(false);
      expect(isPartOfBoxVisibleByPlanes(planes, box)).toBe(false);
    }
  });

  test('should test with a box that is partly visible', () => {
    const planes = createSomePlanes(min, max, -1);
    expect(isEntireBoxVisibleByPlanes(planes, box)).toBe(false);
    expect(isPartOfBoxVisibleByPlanes(planes, box)).toBe(true);
  });
});

function createSomePlanes(min: Vector3, max: Vector3, distanceFromBox: number): Plane[] {
  return [
    new Plane(new Vector3(+1, 0, 0), min.x - distanceFromBox),
    new Plane(new Vector3(-1, 0, 0), max.x + distanceFromBox),
    new Plane(new Vector3(0, +1, 0), min.y - distanceFromBox),
    new Plane(new Vector3(0, -1, 0), max.y + distanceFromBox),
    new Plane(new Vector3(0, 0, +1), min.z - distanceFromBox),
    new Plane(new Vector3(0, 0, -1), max.z + distanceFromBox)
  ];
}
