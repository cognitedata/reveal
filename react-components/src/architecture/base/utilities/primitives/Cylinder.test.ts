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
} from '#test-utils/primitives/primitiveTestUtil';
import { Cylinder } from './Cylinder';

describe('Cylinder', () => {
  test('Should test all properties on regular primitive', () => {
    const primitive = createVerticalCylinder();
    expect(primitive.primitiveType).toBe(PrimitiveType.Cylinder);
    expect(primitive.area).toBeCloseTo(31.41592653589793);
    expect(primitive.volume).toBeCloseTo(12.566370614359172);
    expect(primitive.height).toBeCloseTo(4);
    expect(primitive.diameter).toBeCloseTo(2);
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
    point.x -= 0.1 * primitive.diameter;
    point.z += 0.1 * primitive.height;
    expect(primitive.isPointInside(point, new Matrix4())).toBe(false);
  });

  test('should intersect vertical primitive and some horizontal line', () => {
    const primitive = createVerticalCylinder();

    for (const xDirection of [-1, 0, 1]) {
      for (const yDirection of [-1, 0, 1]) {
        if (xDirection === 0 && yDirection === 0) {
          continue;
        }
        horizontalIntersection(primitive, xDirection, yDirection, 0);
        horizontalIntersection(primitive, xDirection, yDirection, 0.9);
        horizontalIntersection(primitive, xDirection, yDirection, 1.1, false);
      }
    }

    for (const zDirection of [-1, 1]) {
      verticalIntersection(primitive, zDirection, 0, 0);
      verticalIntersection(primitive, zDirection, 0.5, 0);
      verticalIntersection(primitive, zDirection, 0, 0.5);
      verticalIntersection(primitive, zDirection, 0.5, -0.5);
      verticalIntersection(primitive, zDirection, -0.5, -0.5);
      verticalIntersection(primitive, zDirection, 1, 1, false);
      verticalIntersection(primitive, zDirection, 1, -1, false);
    }

    function horizontalIntersection(
      primitive: Cylinder,
      xDirection: number,
      yDirection: number,
      zOffset: number,
      expectIntersection = true
    ): void {
      const direction = new Vector3(xDirection, yDirection, 0);
      direction.normalize();

      const origin = primitive.center.clone();
      origin.z += (zOffset * primitive.height) / 2;
      origin.addScaledVector(direction, -2 * primitive.radius);

      const expectedIntersection = primitive.center.clone();
      expectedIntersection.z += (zOffset * primitive.height) / 2;
      expectedIntersection.addScaledVector(direction, -primitive.radius);

      const ray = new Ray(origin, direction);
      const actualIntersection = primitive.intersectRay(ray, new Matrix4());
      if (!expectIntersection) {
        expect(actualIntersection).toBeUndefined();
        return;
      }
      expectEqualVector3(actualIntersection, expectedIntersection);
    }

    function verticalIntersection(
      primitive: Cylinder,
      zDirection: number,
      xOffset: number,
      yOffset: number,
      expectIntersection = true
    ): void {
      const direction = new Vector3(0, 0, zDirection);
      direction.normalize();

      const origin = primitive.center.clone();

      origin.x += xOffset * primitive.radius;
      origin.y += yOffset * primitive.radius;
      origin.z += -zDirection * primitive.height;

      const expectedIntersection = primitive.center.clone();
      expectedIntersection.x += xOffset * primitive.radius;
      expectedIntersection.y += yOffset * primitive.radius;
      expectedIntersection.z += (-zDirection * primitive.height) / 2;

      const ray = new Ray(origin, direction);
      const actualIntersection = primitive.intersectRay(ray, new Matrix4());
      if (!expectIntersection) {
        expect(actualIntersection).toBeUndefined();
        return;
      }
      expectEqualVector3(actualIntersection, expectedIntersection);
    }
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
    expectEqualVector3(primitive.centerA, new Vector3(0, 0, -Cylinder.HalfMinSize));
    expectEqualVector3(primitive.centerB, new Vector3(0, 0, +Cylinder.HalfMinSize));
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
