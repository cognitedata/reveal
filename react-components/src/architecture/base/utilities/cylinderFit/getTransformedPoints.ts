import { type Matrix4, Vector3 } from 'three';

/**
 * Generates transformed 3D points by applying a transformation matrix to each point in the input array.
 *
 * @param points - An array of `Vector3` points to be transformed.
 * @param matrix - The `Matrix4` transformation matrix to apply to each point.
 * @param useInverse - If `true` (default), the inverse of the matrix is used for transformation; otherwise, the matrix is used as-is.
 * @returns A generator that yields each transformed `Vector3` point.
 *
 * @remarks
 * The generator reuses a single `Vector3` instance for yielding transformed points,
 * so consumers should copy the yielded value if they need to retain it.
 */
export function* getTransformedPoints(
  points: Vector3[],
  matrix: Matrix4,
  useInverse = true
): Generator<Vector3> {
  if (useInverse) {
    matrix = matrix.clone().invert();
  }
  const transformed = new Vector3(); // Reuse this point to avoid too many allocations
  for (const point of points) {
    transformed.copy(point);
    transformed.applyMatrix4(matrix);
    yield transformed;
  }
}
