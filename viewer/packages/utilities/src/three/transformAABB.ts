/*!
 * Copyright 2025 Cognite AS
 */
import { Vector3, Box3, type Matrix4 } from 'three';
import { visitBox3CornerPoints } from './visitBox3CornerPoints';

/**
 * Transforms an Axis-Aligned Bounding Box (AABB) by a 4x4 transformation matrix.
 *
 * This function calculates a **new** AABB that encloses the original box after it has been transformed by the provided matrix.
 * This is done by transforming all eight corner points of the original box and then finding the minimum and maximum coordinates
 * of the resulting points to form the new AABB.
 *
 * @param {Box3} box The original AABB to be transformed.
 * @param {Matrix4} matrix The 4x4 transformation matrix.
 * @returns {Box3} The new AABB that encloses the transformed box.
 */

export function transformAABB(box: Box3, matrix: Matrix4): Box3 {
  const transformedCorners: Vector3[] = [];
  visitBox3CornerPoints(box, corner => {
    const transformedCorner = corner.clone().applyMatrix4(matrix);
    transformedCorners.push(transformedCorner);
  });
  const minX = Math.min(...transformedCorners.map(c => c.x));
  const minY = Math.min(...transformedCorners.map(c => c.y));
  const minZ = Math.min(...transformedCorners.map(c => c.z));

  const maxX = Math.max(...transformedCorners.map(c => c.x));
  const maxY = Math.max(...transformedCorners.map(c => c.y));
  const maxZ = Math.max(...transformedCorners.map(c => c.z));

  return new Box3(new Vector3(minX, minY, minZ), new Vector3(maxX, maxY, maxZ));
}
