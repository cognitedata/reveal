/*!
 * Copyright 2024 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { Vector3ArrayUtils } from './PointsUtils';
import { Box3, Vector3 } from 'three';
import {
  expectEqualBox3,
  expectEqualVector3
} from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';

describe(Vector3ArrayUtils.name, () => {
  const polygon = [
    new Vector3(0, 0, 0),
    new Vector3(1, 0, 0),
    new Vector3(2, 0, 0),
    new Vector3(2, 1, 0),
    new Vector3(2, 3, 0),
    new Vector3(0, 3, 0)
  ];
  const emptyPolygon: Vector3[] = [];

  test('should calculate area', () => {
    const actualArea = Vector3ArrayUtils.getSignedHorizontalArea(polygon);
    expect(actualArea).toBeCloseTo(6, 6);
  });

  test('should calculate center', () => {
    const expectedCenter = new Vector3(1, 1.5, 0);
    const actualCenter = Vector3ArrayUtils.getCenter(polygon);
    expectEqualVector3(actualCenter, expectedCenter);
  });

  test('should calculate bounding box', () => {
    const actualBoundingBox = Vector3ArrayUtils.getBoundingBox(polygon);
    expect(actualBoundingBox).not.toBeUndefined();
    if (actualBoundingBox === undefined) {
      return;
    }
    const expectedBoundingBox = new Box3(new Vector3(0, 0, 0), new Vector3(2, 3, 0));
    expectEqualBox3(actualBoundingBox, expectedBoundingBox);
  });

  test('should calculate area', () => {
    const emptyPolygon: Vector3[] = [];
    const actualArea = Vector3ArrayUtils.getSignedHorizontalArea(emptyPolygon);
    expect(actualArea).toBe(0);
  });

  test('should calculate center', () => {
    const actualCenter = Vector3ArrayUtils.getCenter(emptyPolygon);
    expect(actualCenter).toBeUndefined();
  });

  test('should calculate bounding box', () => {
    const emptyPolygon: Vector3[] = [];
    const actualBoundingBox = Vector3ArrayUtils.getBoundingBox(emptyPolygon);
    expect(actualBoundingBox).toBeUndefined();
  });
});
