import { assert, describe, expect, test } from 'vitest';
import { Vector3ArrayUtils } from './Vector3ArrayUtils';
import { Box3, Vector3 } from 'three';
import { expectEqualBox3, expectEqualVector3 } from '#test-utils/primitives/primitiveTestUtil';

describe(Vector3ArrayUtils.name, () => {
  const polygon = [
    new Vector3(0, 0, 0),
    new Vector3(1, 0, 0),
    new Vector3(2, 0, 0),
    new Vector3(2, 1, 0),
    new Vector3(2, 3, 0),
    new Vector3(0, 3, 0)
  ];

  test('should calculate area', () => {
    const actualArea = Vector3ArrayUtils.getSignedHorizontalArea(polygon);
    expect(actualArea).toBeCloseTo(6, 6);
  });

  test('should calculate center', () => {
    const actualCenter = Vector3ArrayUtils.getCenter(polygon);
    expectEqualVector3(actualCenter, new Vector3(1, 1.5, 0));
  });

  test('should calculate center of mass', () => {
    const actualCenter = Vector3ArrayUtils.getCenterOfMass(polygon);
    expectEqualVector3(actualCenter, new Vector3(7 / 6, 7 / 6, 0));
  });

  test('should calculate bounding box', () => {
    const actualBoundingBox = Vector3ArrayUtils.getBoundingBox(polygon);
    expect(actualBoundingBox).not.toBeUndefined();
    assert(actualBoundingBox !== undefined);
    const expectedBoundingBox = new Box3(new Vector3(0, 0, 0), new Vector3(2, 3, 0));
    expectEqualBox3(actualBoundingBox, expectedBoundingBox);
  });

  test('should return 0 when calculate area on empty polygon', () => {
    const actualArea = Vector3ArrayUtils.getSignedHorizontalArea([]);
    expect(actualArea).toBe(0);
  });

  test('should return undefined when calculation center on empty points', () => {
    const actualCenter = Vector3ArrayUtils.getCenter([]);
    expect(actualCenter).toBeUndefined();
  });

  test('should return undefined when calculation center of mass on empty points', () => {
    const actualCenter = Vector3ArrayUtils.getCenterOfMass([]);
    expect(actualCenter).toBeUndefined();
  });

  test('should return undefined when calculation bounding box on empty points', () => {
    const actualBoundingBox = Vector3ArrayUtils.getBoundingBox([]);
    expect(actualBoundingBox).toBeUndefined();
  });
});
