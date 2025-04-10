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

describe('getBoundingBoxFromPlanes', () => {
  test('should test with no planes', () => {
    const originalBox = new Range3(min, max);
    const planes: Plane[] = [];
    const actualBox = getBoundingBoxFromPlanes(planes, originalBox);
    expect(actualBox).toStrictEqual(originalBox);
  });

  test('should find a smaller bounding box', () => {
    const originalBox = new Range3(min, max);
    const smallerBox = originalBox.clone();
    smallerBox.expandByMargin(-1);

    const planes = createPlanesAtTheEdgesOfBox(smallerBox);
    const actualBox = getBoundingBoxFromPlanes(planes, originalBox);
    expect(actualBox).toStrictEqual(smallerBox);
  });

  test('should find a  bounding box', () => {
    const originalBox = new Range3(min, max);
    const largerBox = originalBox.clone();
    largerBox.expandByMargin(1);

    const planes = createPlanesAtTheEdgesOfBox(largerBox);
    const actualBox = getBoundingBoxFromPlanes(planes, originalBox);
    expect(actualBox).toStrictEqual(originalBox);
  });
});
