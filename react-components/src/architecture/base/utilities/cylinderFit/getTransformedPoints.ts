import { type Matrix4, Vector3 } from 'three';

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
