/*!
 * Copyright 2025 Cognite AS
 */

import { describe, expect, test } from 'vitest';
import { PrimitiveType } from './PrimitiveType';
import { Box3, Matrix4, Ray, Vector3 } from 'three';
import {
  expectEqualMatrix4,
  expectEqualBox3,
  expectEqualVector3
} from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';
import { Cylinder } from './Cylinder';

describe('Cylinder', () => {
  test('Should test all properties on regular primitive', () => {
    const primitive = createVerticalCylinder();
    expect(primitive.primitiveType).toBe(PrimitiveType.Cylinder);
    expect(primitive.area).toBe(25.132741228718345);
    expect(primitive.volume).toBe(12.566370614359172);
    expect(primitive.height).toBe(4);
    expect(primitive.diameter).toBe(2);
    expectEqualVector3(primitive.center, new Vector3(1, 2, 0));
    expectEqualVector3(primitive.size, new Vector3(2, 2, 4));
    expectEqualVector3(primitive.axis, new Vector3(0, 0, 1));
  });

  test('should test get and set matrix on vertical primitive', () => {
    const primitive = createVerticalCylinder();
    const matrix = primitive.getMatrix();
    primitive.setMatrix(matrix);
    expectEqualMatrix4(matrix, primitive.getMatrix());
  });

  test('should test getScaledMatrix', () => {
    const primitive = createVerticalCylinder();
    const actual = primitive.getScaledMatrix(primitive.size);
    const expected = new Matrix4().compose(
      primitive.center,
      primitive.getQuaternion(),
      primitive.size
    );
    expectEqualMatrix4(actual, expected);
  });

  test('should test getRotationMatrix', () => {
    const primitive = createVerticalCylinder();
    const actual = primitive.getRotationMatrix();
    const expected = new Matrix4().makeRotationFromQuaternion(primitive.getQuaternion());
    expectEqualMatrix4(actual, expected);
  });

  test('should test expandBoundingBox', () => {
    const primitive = createVerticalCylinder();
    const boundingBox = primitive.getBoundingBox();
    expectEqualBox3(boundingBox, new Box3(new Vector3(0, 1, -2), new Vector3(2, 3, 2)));
  });

  test('should test isPointInside', () => {
    const primitive = createVerticalCylinder();

    // Inside
    const point = primitive.center.clone();
    expect(primitive.isPointInside(point, new Matrix4())).toBe(true);
    point.x += 0.45 * primitive.diameter;
    expect(primitive.isPointInside(point, new Matrix4())).toBe(true);
    point.z += 0.45 * primitive.height;
    expect(primitive.isPointInside(point, new Matrix4())).toBe(true);

    // Outside
    point.x += 0.1 * primitive.diameter;
    expect(primitive.isPointInside(point, new Matrix4())).toBe(false);
    point.z += 0.1 * primitive.height;
    expect(primitive.isPointInside(point, new Matrix4())).toBe(false);
  });

  test('should intersect vertical primitive and horizontal line along x', () => {
    const primitive = createVerticalCylinder();
    const origin = primitive.center.clone();
    origin.x -= 2 * primitive.radius;
    const direction = new Vector3(1, 0, 0);
    const intersectionExpect = primitive.center.clone();
    intersectionExpect.x -= primitive.radius;
    const ray = new Ray(origin, direction);
    const intersection = primitive.intersectRay(ray, new Matrix4());
    expectEqualVector3(intersection, intersectionExpect);
  });

  test('should intersect vertical primitive and horizontal line along y', () => {
    const primitive = createVerticalCylinder();
    const origin = primitive.center.clone();
    origin.y -= 2 * primitive.radius;
    const direction = new Vector3(0, 1, 0);
    const intersectionExpect = primitive.center.clone();
    intersectionExpect.y -= primitive.radius;
    const ray = new Ray(origin, direction);
    const intersection = primitive.intersectRay(ray, new Matrix4());
    expectEqualVector3(intersection, intersectionExpect);
  });

  test('should test copy', () => {
    const primitive = createVerticalCylinder();
    const other = new Cylinder();
    other.copy(primitive);
    expect(other.radius).toBe(primitive.radius);
    expectEqualVector3(other.centerA, primitive.centerA);
    expectEqualVector3(other.centerB, primitive.centerB);
  });

  test('should test clear', () => {
    const primitive = createVerticalCylinder();
    primitive.clear();
    expect(primitive.radius).toBe(Cylinder.MinSize);
    expectEqualVector3(primitive.centerA, new Vector3(0, 0, -Cylinder.MinSize));
    expectEqualVector3(primitive.centerB, new Vector3(0, 0, +Cylinder.MinSize));
  });

  test('should test forceMinSize', () => {
    const primitive = new Cylinder();
    primitive.radius = 0;
    primitive.forceMinSize();
    expect(primitive.radius).toBe(Cylinder.MinSize);
  });
});

function createVerticalCylinder(): Cylinder {
  const primitive = new Cylinder();
  primitive.radius = 1;
  primitive.centerA.set(1, 2, -2);
  primitive.centerB.set(1, 2, +2);
  return primitive;
}
