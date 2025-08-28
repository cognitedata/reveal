import { assert, describe, expect, test } from 'vitest';
import { Vector3 } from 'three';
import { bestFitCylinder, MAIN_AXISES } from './bestFitCylinder';
import { Cylinder } from './Cylinder';
import { getRandomFloatBetween } from '../extensions/mathUtils';
import { beforeEach } from 'node:test';
import SeededRandom from 'random-seed';

type Random = SeededRandom.RandomSeed;

describe(bestFitCylinder.name, () => {
  const random = SeededRandom.create();
  beforeEach(() => {
    random.seed(bestFitCylinder.name);
  });

  test('should get the cylinder for main axis', () => {
    for (const axis of MAIN_AXISES) {
      // Make an arbitrary oriented cylinder and sample points on it
      const expectedCylinder = new Cylinder(new Vector3(1, 2, 3), axis, 3, 6);
      const points = createPoints(expectedCylinder, 100, random);
      checkCorrectness(bestFitCylinder(points), expectedCylinder);
    }
  });

  test('should get the cylinder for arbitrarily axis, center, radius and height for few points', () => {
    for (let i = 0; i < 20; i++) {
      const expectedCylinder = getRandomCylinder(random);
      const points = createPoints(expectedCylinder, 10, random);
      checkCorrectness(bestFitCylinder(points), expectedCylinder);
    }
  });

  test('should get the cylinder for arbitrarily axis, center, radius and height for many points', () => {
    for (let i = 0; i < 20; i++) {
      const expectedCylinder = getRandomCylinder(random);
      const points = createPoints(expectedCylinder, 100, random);
      checkCorrectness(bestFitCylinder(points), expectedCylinder);
    }
  });

  test('should get the cylinder for arbitrarily axis, center, radius and height with some errors', () => {
    const relativeRadiusError = 0.2;
    const arcFraction = 0.5;
    for (let i = 0; i < 20; i++) {
      const expectedCylinder = getRandomCylinder(random);
      const points = createPoints(expectedCylinder, 100, random, relativeRadiusError, arcFraction);
      checkCorrectness(bestFitCylinder(points), expectedCylinder, 0.2);
    }
  });

  test('should not get a vertical cylinder when no points', () => {
    const cylinder = bestFitCylinder([]);
    expect(cylinder).toBeUndefined();
  });

  test('should not get a cylinder when too few points', () => {
    const points = [new Vector3(1, 2, 3), new Vector3(4, 5, 6)];
    const cylinder = bestFitCylinder(points);
    expect(cylinder).toBeUndefined();
  });

  test('should not get a cylinder when all points are the same', () => {
    const points = new Array(10).fill(new Vector3(1, 2, 3));
    const cylinder = bestFitCylinder(points);
    expect(cylinder).toBeUndefined();
  });

  test('should not get a cylinder if the rms is too large', () => {
    const expectedCylinder = getRandomCylinder(random);
    const points = createPoints(expectedCylinder, 10, random, 0.4, 1);
    const accept = (cylinder: Cylinder): boolean => cylinder.rms < 0.1;
    const cylinder = bestFitCylinder(points, accept);
    expect(cylinder).toBeUndefined();
  });
});

function checkCorrectness(
  actualCylinder: Cylinder | undefined,
  expectedCylinder: Cylinder,
  tolerance = 0.1
): void {
  expect(actualCylinder).toBeDefined();
  assert(actualCylinder !== undefined);

  const radiusError = getError(actualCylinder.radius, expectedCylinder.radius);
  const heightError = getError(actualCylinder.height, expectedCylinder.height);
  const centerError = getCenterError(actualCylinder, expectedCylinder);
  const axisError = getAxisError(actualCylinder, expectedCylinder);

  expect(radiusError).lessThan(tolerance, 'Cylinder Radius is off');
  expect(axisError).lessThan(tolerance, 'Cylinder Axis is off');
  expect(centerError).lessThan(tolerance, 'Cylinder Center is off');
  expect(heightError).lessThan(tolerance, 'Cylinder Height is off');
}

function getError(actual: number, expected: number): number {
  return Math.abs((actual - expected) / actual);
}

/**
 * Calculates the normalized error between the centers of two cylinders.
 *
 * The error is computed as the Euclidean distance between the centers of the
 * `actual` and `expected` cylinders, divided by the radius of the `expected` cylinder.
 *
 * @param actual - The cylinder whose center is being compared.
 * @param expected - The reference cylinder to compare against.
 * @returns The normalized center error as a number.
 */
function getCenterError(actual: Cylinder, expected: Cylinder): number {
  return actual.center.distanceTo(expected.center) / expected.radius;
}

/**
 * Computes the normalized angular error between the axes of two cylinders.
 *
 * The error is calculated as the absolute angle between the two axis vectors,
 * normalized by the maximum possible error (π/2 radians, i.e., 90 degrees, when the axes are perpendicular).
 * The result is a value between 0 (axes are perfectly aligned) and 1 (axes are perpendicular).
 *
 * @param actual - The cylinder whose axis is being compared.
 * @param expected - The reference cylinder to compare against.
 * @returns The normalized axis error as a number between 0 and 1.
 */
function getAxisError(actual: Cylinder, expected: Cylinder): number {
  const maxError = Math.PI / 2; // This is the worst case scenario, when the axis are perpendicular

  // Calculate the bidirectional angle between the two axis
  let dotProduct = expected.axis.dot(actual.axis);
  if (dotProduct < 0) {
    dotProduct = -dotProduct;
  }
  if (dotProduct > 1) {
    dotProduct = 1;
  }
  const acos = Math.acos(dotProduct);
  const angle = Math.abs(acos);
  return angle / maxError;
}

/**
 * Generates an array of random points distributed on the surface of a cylinder.
 *
 * @param cylinder - The cylinder object containing height, radius, and transformation matrix.
 * @param count - The number of points to generate.
 * @param random - An instance of `SeededRandom` for generating random numbers.|
 * @param relativeRadiusError - Optional relative error to apply to the radius of each point.
 * @param arcFraction - Optional fraction of the cylinder's circumference to cover (0 to 1).
 * @returns An array of `Vector3` points positioned on the surface of the cylinder.
 */
function createPoints(
  cylinder: Cylinder,
  count: number,
  random: Random,
  relativeRadiusError = 0,
  arcFraction = 1
): Vector3[] {
  const { height } = cylinder;
  const matrix = cylinder.getTranslationRotationMatrix();
  const points = new Array<Vector3>(count);

  const maxAngle = arcFraction * 2 * Math.PI;
  for (let i = 0; i < points.length; i++) {
    const angle = random.floatBetween(0, maxAngle);

    let radius = cylinder.radius;
    if (relativeRadiusError > 0) {
      radius += radius * random.floatBetween(-relativeRadiusError, relativeRadiusError);
    }
    // Make sure that we get points at the top and bottom, and some in between
    let z;
    if (i === 0) {
      z = -0.5;
    } else if (i === 1) {
      z = 0.5;
    } else {
      z = random.floatBetween(-0.5, 0.5);
    }
    z *= height;
    const point = new Vector3(radius * Math.cos(angle), radius * Math.sin(angle), z);
    point.applyMatrix4(matrix);
    points[i] = point;
  }
  return points;
}

function getRandomCylinder(random: Random): Cylinder {
  const axis = getRandomUnitVector(random);
  const center = getRandomPoint(random);
  const radius = getRandomFloatBetween(1, 5);
  const height = getRandomFloatBetween(1, 5) * radius;
  return new Cylinder(center, axis, radius, height);
}

function getRandomUnitVector(random: Random): Vector3 {
  return new Vector3(random.random(), random.random(), random.random()).normalize();
}

function getRandomPoint(random: Random): Vector3 {
  const min = -10;
  const max = 10;
  return new Vector3(
    random.floatBetween(min, max),
    random.floatBetween(min, max),
    random.floatBetween(min, max)
  );
}
