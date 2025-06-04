import { type Vector3, type Vector2 } from 'three';
import { square } from './mathExtensions';

/**
 * Computes the horizontal angle in radians with respect to the positive x-axis.
 *
 * @param vector - The input vector for which the angle is to be computed.
 * @returns The angle in radians.
 *
 * @remarks
 * Copied from tree.js source code (https://github.com/mrdoob/three.js/blob/master/src/math/Vector2.js)
 */

export function horizontalAngle(vector: Vector3): number {
  return Math.atan2(-vector.y, -vector.x) + Math.PI;
}

/**
 * Calculates the horizontal distance between two 3D vectors, ignoring the z-axis.
 *
 * @param from - The starting vector.
 * @param to - The ending vector.
 * @returns The horizontal distance between the two vectors.
 */
export function horizontalDistanceTo(from: Vector3, to: Vector3): number {
  return Math.sqrt(square(from.x - to.x) + square(from.y - to.y));
}

/**
 * Calculates the vertical distance between two 3D vectors.
 *
 * @param from - The starting vector.
 * @param to - The ending vector.
 * @returns The absolute vertical distance between the `from` and `to` vectors.
 */
export function verticalDistanceTo(from: Vector3, to: Vector3): number {
  return Math.abs(from.z - to.z);
}

/**
 * Rotates a 2D or 3D vector around the horizontal axis by a given angle.
 *
 * @param vector - The vector to be rotated.
 * @param angle - The angle in radians by which to rotate the vector.
 */
export function rotateHorizontal(vector: Vector3 | Vector2, angle: number): void {
  const dx = vector.x;
  vector.x = dx * Math.cos(angle) - vector.y * Math.sin(angle);
  vector.y = dx * Math.sin(angle) + vector.y * Math.cos(angle);
}

/**
 * Rotates a 2D or 3D vector by 90 degrees (π/2 radians) counterclockwise.
 *
 * @param vector - The vector to be rotated. Can be either a Vector2 or Vector3.
 */
export function rotatePiHalf(vector: Vector3 | Vector2): void {
  const x = vector.x;
  vector.x = -vector.y;
  vector.y = x;
}

/**
 * Returns the index of the component with the maximum absolute value in a given vector.
 *
 * @param vector - The vector from which to find the component with the maximum absolute value.
 * @returns The index of the component with the maximum absolute value (0, 1, or 2).
 */
export function getAbsMaxComponent(vector: Vector3): number {
  let max = 0;
  let maxIndex = 0;
  for (let index = 0; index < 3; index++) {
    const value = Math.abs(vector.getComponent(index));
    if (value < max) {
      continue;
    }
    maxIndex = index;
    max = value;
  }
  return maxIndex;
}

/**
 * Computes the horizontal cross product of two vectors.
 * The horizontal cross product is defined as:
 * `self.x * other.y - self.y * other.x`
 *
 * This function works for both 2D and 3D vectors. For 3D vectors, only the x and y components are considered.
 *
 * @param self - The first vector
 * @param other - The second vector
 * @returns The horizontal cross product of the two vectors.
 */
export function getHorizontalCrossProduct(
  self: Vector3 | Vector2,
  other: Vector3 | Vector2
): number {
  return self.x * other.y - self.y * other.x;
}

/**
 * Calculates the octant of a given 2D vector.
 *
 * The octant are defined as follows:
 *
 *         North (Positive Y-axis)
 *        3  2  1
 * West   4  *  0 East (Positive X-axis)
 *        5  6  7
 *         South
 *
 * @param vector - The 2D vector for which to calculate the octant.
 * @returns The octant as an integer between 0 and 7.
 */
export function getOctant(vector: Vector2): number {
  const angle = vector.angle();

  // Normalize angle to (0,1) so it is easier to work with
  let normalized = angle / (2 * Math.PI);

  // Force between 0 and 1
  while (normalized < 0) normalized += 1;
  while (normalized > 1) normalized -= 1;

  // Convert it to integer between 0 and 7
  const octdir = Math.round(8 * normalized);

  // Check to be sure
  if (octdir >= 8) {
    return octdir - 8;
  }
  if (octdir < 0) {
    return octdir + 8;
  }
  return octdir;
}
