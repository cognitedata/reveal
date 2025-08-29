import { assert, describe, expect, test } from 'vitest';
import { Matrix4, Vector3 } from 'three';
import { bestFitVerticalCylinder } from './bestFitVerticalCylinder';
import { expectEqualVector3 } from '../../../../../tests/tests-utilities/primitives/primitiveTestUtil';
import { getTranslationRotationMatrix, UP_VECTOR } from './LeastSquareCylinderResult';

describe(bestFitVerticalCylinder.name, () => {
  test('should get a vertical cylinder for 3 points', () => {
    const matrix = new Matrix4().identity();
    const points = [new Vector3(2, 0, 3), new Vector3(3, 1, 1), new Vector3(2, 2, 2)];
    const cylinder = bestFitVerticalCylinder(points, matrix);
    expect(cylinder).toBeDefined();
    assert(cylinder !== undefined);
    expect(cylinder.radius).toBeCloseTo(1);
    expect(cylinder.height).toBeCloseTo(2);
    expectEqualVector3(cylinder.axis, UP_VECTOR);
    expectEqualVector3(cylinder.center, new Vector3(2, 1, 2));
  });

  test('should get a vertical cylinder for many points', () => {
    // Make an arbitrary oriented cylinder and sample points on it
    const expectedCenter = new Vector3(2, 3, 4);
    const expectedRadius = 6;
    const expectedHeight = 7;

    // Create the points
    const points = createPoints(expectedRadius, expectedHeight, 100);

    const matrix = getTranslationRotationMatrix(new Vector3(1, 2, 3), expectedCenter);
    for (const point of points) {
      point.applyMatrix4(matrix);
    }
    const cylinder = bestFitVerticalCylinder(points, matrix.clone().invert());
    expect(cylinder).toBeDefined();
    assert(cylinder !== undefined);
    expect(cylinder.radius).toBeCloseTo(expectedRadius);
    expect(cylinder.height).toBeCloseTo(expectedHeight);
    expectEqualVector3(cylinder.axis, UP_VECTOR);
    expectEqualVector3(cylinder.center, new Vector3());

    // Transform the center back to the original space and check that it is correct
    const center = cylinder.center.clone();
    center.applyMatrix4(matrix);
    expectEqualVector3(center, expectedCenter);
  });

  test('should not get a vertical cylinder when too few points', () => {
    const matrix = new Matrix4().identity();
    const points = [new Vector3(1, 2, 3), new Vector3(4, 5, 6)];
    const cylinder = bestFitVerticalCylinder(points, matrix);
    expect(cylinder).toBeUndefined();
  });

  test('should not get a vertical cylinder when all points are the same', () => {
    const matrix = new Matrix4().identity();
    const points = new Array(10).fill(new Vector3(1, 2, 3));
    const cylinder = bestFitVerticalCylinder(points, matrix);
    expect(cylinder).toBeUndefined();
  });

  test('should not get a vertical cylinder when all points are on a line', () => {
    const matrix = new Matrix4().identity();
    const points: Vector3[] = [];
    for (let i = 0; i < 10; i++) {
      points.push(new Vector3(i, i, i));
    }
    const cylinder = bestFitVerticalCylinder(points, matrix);
    expect(cylinder).toBeUndefined();
  });
});

/**
 * Generates an array of points distributed on the surface of a vertical cylinder.
 * The cylinder is centered at the origin, aligned with the Z-axis.
 * @param radius - The radius of the cylinder.
 * @param height - The height of the cylinder.
 * @param count - The number of points to generate.
 * @returns An array of `Vector3` points positioned on the surface of the cylinder.
 */
function createPoints(radius: number, height: number, count: number): Vector3[] {
  const points: Vector3[] = new Array<Vector3>(count);
  const scaling = new Vector3(radius, radius, height / 2);
  for (let i = 0; i < points.length; i++) {
    const angle = (i / points.length) * Math.PI * 2;
    const point = new Vector3(Math.cos(angle), Math.sin(angle), i % 2 === 0 ? -1 : 1);
    point.multiply(scaling);
    points[i] = point;
  }
  return points;
}
