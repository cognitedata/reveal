import { type Matrix4, Vector3 } from 'three';
import { Cylinder, UP_VECTOR } from './Cylinder';
import { LeastSquare } from './LeastSquare';
import { Range1 } from '../geometry/Range1';
import { horizontalLengthSq } from '../extensions/vectorUtils';

/**
 * Computes the best-fit vertical cylinder for a set of 3D points.
 *
 * The function transforms each point using the provided matrix, then fits a vertical cylinder
 * (aligned with the Z-axis) to the transformed points using a least squares approach.
 * Returns the cylinder if a valid fit is found, or `undefined` otherwise.
 *
 * @param points - An array of 3D points (`Vector3`) to fit the cylinder to.
 * @param matrix - A transformation matrix (`Matrix4`) applied to each point before fitting.
 * @returns The fitted `Cylinder` object if successful, or `undefined` if the fit fails.
 */
export function bestFitVerticalCylinder(points: Vector3[], matrix: Matrix4): Cylinder | undefined {
  const leastSquare = new LeastSquare(3);
  const zRange = new Range1();

  for (const point of points) {
    const transformed = point.clone().applyMatrix4(matrix);
    zRange.add(transformed.z);
    leastSquare.addEquation(
      [2 * transformed.x, 2 * transformed.y, -1],
      horizontalLengthSq(transformed)
    );
  }
  const solution = leastSquare.compute();
  if (solution === undefined) {
    return undefined;
  }
  const center = new Vector3(solution[0], solution[1], zRange.center);
  const radius = Math.sqrt(horizontalLengthSq(center) - solution[2]);
  if (radius <= 0) {
    return undefined; // Should be impossible, but you never know...
  }
  const height = Math.max(zRange.delta, radius / 100); // Just give a small height if all points are in a plane
  return new Cylinder(center, UP_VECTOR, radius, height);
}
