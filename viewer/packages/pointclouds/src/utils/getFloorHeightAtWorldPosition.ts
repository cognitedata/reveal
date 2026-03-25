/*!
 * Copyright 2024 Cognite AS
 */

import { BufferAttribute, Vector3 } from 'three';
import { PointCloudOctree } from '../potree-three-loader/tree/PointCloudOctree';

/**
 * Estimates the floor height at a given world XZ position by sampling loaded point cloud
 * data (CPU-side, no GPU pick needed).
 *
 * Iterates visible octree nodes overlapping the search region, collects Y values of points
 * within `searchRadiusXZ` meters and below `stationY`, then returns the median.
 *
 * @param worldPos     World position of the station (XZ used for search, Y as upper bound).
 * @param octrees      List of point cloud octrees to search.
 * @param searchRadiusXZ  Horizontal search radius in metres (default 2.0).
 * @returns Median floor Y in world space, or `undefined` if no points were found.
 */
export function getFloorHeightAtWorldPosition(
  worldPos: Vector3,
  octrees: PointCloudOctree[],
  searchRadiusXZ: number = 2.0
): number | undefined {
  const floorYValues: number[] = [];
  const radiusSq = searchRadiusXZ * searchRadiusXZ;

  // Only consider points below the station (floor, not ceiling/equipment above)
  const maxY = worldPos.y;

  const _pos = new Vector3();

  for (const octree of octrees) {
    for (const node of octree.visibleNodes) {
      const sceneNode = node.sceneNode;
      if (!sceneNode) continue;

      // Cheap AABB cull in world space before iterating points.
      const nodeBox = node.boundingBox.clone().applyMatrix4(sceneNode.matrixWorld);
      if (
        nodeBox.max.x < worldPos.x - searchRadiusXZ ||
        nodeBox.min.x > worldPos.x + searchRadiusXZ ||
        nodeBox.max.z < worldPos.z - searchRadiusXZ ||
        nodeBox.min.z > worldPos.z + searchRadiusXZ ||
        nodeBox.min.y > maxY
      ) {
        continue;
      }

      const posAttr = sceneNode.geometry.getAttribute('position') as BufferAttribute;
      const worldMatrix = sceneNode.matrixWorld;

      // Sample every few points to keep performance acceptable on large nodes.
      const step = Math.max(1, Math.floor(posAttr.count / 500));

      for (let i = 0; i < posAttr.count; i += step) {
        _pos.fromBufferAttribute(posAttr, i).applyMatrix4(worldMatrix);

        if (_pos.y > maxY) continue;

        const dx = _pos.x - worldPos.x;
        const dz = _pos.z - worldPos.z;
        if (dx * dx + dz * dz > radiusSq) continue;

        floorYValues.push(_pos.y);
      }
    }
  }

  if (floorYValues.length === 0) return undefined;

  floorYValues.sort((a, b) => a - b);
  const mid = Math.floor(floorYValues.length / 2);
  return floorYValues.length % 2 === 0 ? (floorYValues[mid - 1] + floorYValues[mid]) / 2 : floorYValues[mid];
}
