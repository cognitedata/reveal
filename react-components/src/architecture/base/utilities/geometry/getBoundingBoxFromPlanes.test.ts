/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';

import { Vector3, type Plane } from 'three';
import { getBoundingBoxFromPlanes } from './getBoundingBoxFromPlanes';
import { Range3 } from './Range3';
import { createPlanesAtTheEdgesOfBox } from './isBoxVisibleByPlanes.test';

const min = new Vector3(100, 200, 300);
const max = new Vector3(400, 600, 800);
const originalBox = new Range3(min, max);

describe('getBoundingBoxFromPlanes', () => {
  test('should find the same bounding box with no planes', () => {
    const planes: Plane[] = [];
    const actualBox = getBoundingBoxFromPlanes(planes, originalBox);
    expect(actualBox).toStrictEqual(originalBox);
  });

  test('should find a the same bounding box with all 6 planes', () => {
    const largerBox = originalBox.clone();
    largerBox.expandByMargin(1);

    const planes = createPlanesAtTheEdgesOfBox(largerBox);
    expect(planes).toHaveLength(6);
    const actualBox = getBoundingBoxFromPlanes(planes, originalBox);
    expect(actualBox).toStrictEqual(originalBox);
  });

  test('should find a the same bounding box for vertical planes only', () => {
    const largerBox = originalBox.clone();
    largerBox.x.expandByMargin(1);
    largerBox.y.expandByMargin(1);

    const planes = createPlanesAtTheEdgesOfBox(largerBox, true, false);
    expect(planes).toHaveLength(4);
    const actualBox = getBoundingBoxFromPlanes(planes, originalBox);
    expect(actualBox).toStrictEqual(originalBox);
  });

  test('should find a the same bounding box for horizontal planes only', () => {
    const largerBox = originalBox.clone();
    largerBox.z.expandByMargin(1);

    const planes = createPlanesAtTheEdgesOfBox(largerBox, false, true);
    expect(planes).toHaveLength(2);
    const actualBox = getBoundingBoxFromPlanes(planes, originalBox);
    expect(actualBox).toStrictEqual(originalBox);
  });

  test('should find a smaller bounding box with all 6 planes', () => {
    const smallerBox = originalBox.clone();
    smallerBox.expandByMargin(-1);

    const planes = createPlanesAtTheEdgesOfBox(smallerBox);
    expect(planes).toHaveLength(6);
    const actualBox = getBoundingBoxFromPlanes(planes, originalBox);
    expect(actualBox).toStrictEqual(smallerBox);
  });

  test('should find a smaller bounding box for vertical planes only', () => {
    const smallerBox = originalBox.clone();
    smallerBox.x.expandByMargin(-1);
    smallerBox.y.expandByMargin(-1);

    const planes = createPlanesAtTheEdgesOfBox(smallerBox, true, false);
    expect(planes).toHaveLength(4);
    const actualBox = getBoundingBoxFromPlanes(planes, originalBox);
    expect(actualBox).toStrictEqual(smallerBox);
  });

  test('should find a smaller bounding box for horizontal planes only', () => {
    const smallerBox = originalBox.clone();
    smallerBox.z.expandByMargin(-1);

    const planes = createPlanesAtTheEdgesOfBox(smallerBox, false, true);
    expect(planes).toHaveLength(2);
    const actualBox = getBoundingBoxFromPlanes(planes, originalBox);
    expect(actualBox).toStrictEqual(smallerBox);
  });
});
