/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { PrimitiveType } from './PrimitiveType';
import { Box3, Matrix4, Ray, Vector3 } from 'three';
import {
  expectEqualMatrix4,
  expectEqualBox3,
  expectEqualVector3,
  expectEqualEuler
} from './primitiveUtil.test';
import { Cylinder } from './Cylinder';

describe('Cylinder', () => {
  test('Should test all properties on regular cylinder', () => {
    const cylinder = createVerticalCylinder();
    expect(cylinder.primitiveType).toBe(PrimitiveType.Cylinder);
    expect(cylinder.diagonal).toBe(3.7416573867739413);
    expect(cylinder.area).toBe(22);
    expect(cylinder.volume).toBe(6);
  });

  test('Should test all properties on rotated cylinder', () => {
    const cylinder = createVerticalCylinder();
  });

  test('Should test all properties on flat cylinder', () => {
    const cylinder = createVerticalCylinder();
  });

  test('should test get and set matrix on regular cylinder', () => {
    const cylinder = createVerticalCylinder();
    const matrix = cylinder.getMatrix();
    cylinder.setMatrix(matrix);
    expectEqualMatrix4(matrix, cylinder.getMatrix());
  });

  test('should test get and set matrix on rotated cylinder', () => {
    const cylinder = createVerticalCylinder();
    const matrix = cylinder.getMatrix();
    cylinder.setMatrix(matrix);
    expectEqualMatrix4(matrix, cylinder.getMatrix());
  });

  test('should test expandBoundingBox', () => {
    const cylinder = createVerticalCylinder();
    const boundingBox = new Box3();
    cylinder.expandBoundingBox(boundingBox);
    expectEqualBox3(boundingBox, new Box3(new Vector3(0, 3, -2), new Vector3(2, 4, 2)));
  });

  test('should test isPointInside', () => {
    const cylinder = createVerticalCylinder();
    expect(cylinder.isPointInside(cylinder.center, new Matrix4())).toBe(true);
    expect(cylinder.isPointInside(new Vector3(0, 0, 0), new Matrix4())).toBe(false);
  });

  test('should test intersectRay', () => {
    const cylinder = createVerticalCylinder();

    for (let i = 0; i < 3; i++) {
      // Go along X, Y, Z axis towards the cylinder center, starting from 0 for each axis
      const center = cylinder.center.clone();
      center.setComponent(i, 0);
      const direction = new Vector3();
      direction.setComponent(i, 1);

      const intersectionExpect = cylinder.center.clone();
      intersectionExpect.setComponent(
        i,
        cylinder.center.getComponent(i) - cylinder.size.getComponent(i) / 2
      );

      const ray = new Ray(center, direction);
      const intersection = cylinder.intersectRay(ray, new Matrix4());
      expectEqualVector3(intersection, intersectionExpect);
    }
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
    cylinder.centerA.set(0, 0, 0);
    cylinder.centerB.set(0, 0, 0);
    cylinder.radius = 0;
    cylinder.forceMinSize();
    expect(cylinder.radius).toBe(Cylinder.MinSize);
    expectEqualVector3(cylinder.centerA, new Vector3(0, 0, -Cylinder.MinSize));
    expectEqualVector3(cylinder.centerB, new Vector3(0, 0, +Cylinder.MinSize));
  });
});

function createVerticalCylinder(): Cylinder {
  const cylinder = new Cylinder();
  cylinder.radius = 1;
  cylinder.centerA.set(1, 2, -2);
  cylinder.centerB.set(1, 2, +2);
  return cylinder;
}
