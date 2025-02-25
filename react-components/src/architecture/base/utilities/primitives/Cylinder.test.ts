/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { PrimitiveType } from './PrimitiveType';
import { Box3, Matrix4, Ray, Vector3 } from 'three';
import { expectEqualMatrix4, expectEqualBox3, expectEqualVector3 } from './primitiveUtil.test';
import { Cylinder } from './Cylinder';

describe('Cylinder', () => {
  test('Should test all properties on regular cylinder', () => {
    const cylinder = createVerticalCylinder();
    expect(cylinder.primitiveType).toBe(PrimitiveType.Cylinder);
    expect(cylinder.area).toBe(25.132741228718345);
    expect(cylinder.volume).toBe(12.566370614359172);
    expect(cylinder.height).toBe(4);
    expect(cylinder.diameter).toBe(2);
    expectEqualVector3(cylinder.center, new Vector3(1, 2, 0));
    expectEqualVector3(cylinder.size, new Vector3(2, 2, 4));
    expectEqualVector3(cylinder.axis, new Vector3(0, 0, 1));
  });

  test('should test get and set matrix on vertical cylinder', () => {
    const cylinder = createVerticalCylinder();
    const matrix = cylinder.getMatrix();
    cylinder.setMatrix(matrix);
    expectEqualMatrix4(matrix, cylinder.getMatrix());
  });

  test('should test expandBoundingBox', () => {
    const cylinder = createVerticalCylinder();
    const boundingBox = new Box3();
    cylinder.expandBoundingBox(boundingBox);
    expectEqualBox3(boundingBox, new Box3(new Vector3(0, 1, -2), new Vector3(2, 3, 2)));
  });

  test('should test isPointInside', () => {
    const cylinder = createVerticalCylinder();

    // Inside
    const point = cylinder.center.clone();
    expect(cylinder.isPointInside(point, new Matrix4())).toBe(true);
    point.x += 0.45 * cylinder.diameter;
    expect(cylinder.isPointInside(point, new Matrix4())).toBe(true);
    point.z += 0.45 * cylinder.height;
    expect(cylinder.isPointInside(point, new Matrix4())).toBe(true);

    // Outside
    point.x += 0.1 * cylinder.diameter;
    expect(cylinder.isPointInside(point, new Matrix4())).toBe(false);
    point.z += 0.1 * cylinder.height;
    expect(cylinder.isPointInside(point, new Matrix4())).toBe(false);
  });

  test('should intersect vertical cylinder and horizontal line along x', () => {
    const cylinder = createVerticalCylinder();
    const origin = cylinder.center.clone();
    origin.x -= 2 * cylinder.radius;
    const direction = new Vector3(1, 0, 0);
    const intersectionExpect = cylinder.center.clone();
    intersectionExpect.x -= cylinder.radius;
    const ray = new Ray(origin, direction);
    const intersection = cylinder.intersectRay(ray, new Matrix4());
    expectEqualVector3(intersection, intersectionExpect);
  });

  test('should intersect vertical cylinder and horizontal line along y', () => {
    const cylinder = createVerticalCylinder();
    const origin = cylinder.center.clone();
    origin.y -= 2 * cylinder.radius;
    const direction = new Vector3(0, 1, 0);
    const intersectionExpect = cylinder.center.clone();
    intersectionExpect.y -= cylinder.radius;
    const ray = new Ray(origin, direction);
    const intersection = cylinder.intersectRay(ray, new Matrix4());
    expectEqualVector3(intersection, intersectionExpect);
  });

  test('should test copy', () => {
    const cylinder = createVerticalCylinder();
    const other = new Cylinder();
    other.copy(cylinder);
    expect(other.radius).toBe(cylinder.radius);
    expectEqualVector3(other.centerA, cylinder.centerA);
    expectEqualVector3(other.centerB, cylinder.centerB);
  });

  test('should test clear', () => {
    const cylinder = createVerticalCylinder();
    cylinder.clear();
    expect(cylinder.radius).toBe(Cylinder.MinSize);
    expectEqualVector3(cylinder.centerA, new Vector3(0, 0, -Cylinder.MinSize));
    expectEqualVector3(cylinder.centerB, new Vector3(0, 0, +Cylinder.MinSize));
  });

  test('should test forceMinSize', () => {
    const cylinder = new Cylinder();
    cylinder.radius = 0;
    cylinder.forceMinSize();
    expect(cylinder.radius).toBe(Cylinder.MinSize);
  });
});

function createVerticalCylinder(): Cylinder {
  const cylinder = new Cylinder();
  cylinder.radius = 1;
  cylinder.centerA.set(1, 2, -2);
  cylinder.centerB.set(1, 2, +2);
  return cylinder;
}
