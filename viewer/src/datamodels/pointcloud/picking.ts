/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import * as Potree from '@cognite/potree-core';
import { IntersectInput } from '../base';
import { PointCloudNode } from './PointCloudNode';

export interface IntersectPointCloudNodeResult {
  /**
   * Distance from camera to intersected point.
   */
  distance: number;
  /**
   * Coordinate of the intersected point.
   */
  point: THREE.Vector3;
  /**
   * Point index in the point cloud of the intersected point.
   */
  pointIndex: number;
  /**
   * Point cloud node defining what model the point is a part of.
   */
  pointCloudNode: PointCloudNode;
  /**
   * The geometry object that was intersected.
   */
  object: THREE.Object3D;
}

const normalized = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

export function intersectPointClouds(nodes: PointCloudNode[], input: IntersectInput): IntersectPointCloudNodeResult[] {
  const { normalizedCoords, camera } = input;
  normalized.set(normalizedCoords.x, normalizedCoords.y);
  raycaster.setFromCamera(normalizedCoords, camera);
  raycaster.params.Points = { threshold: 0.01 }; // 1 cm

  const intersections = raycaster.intersectObjects(nodes, true);
  return intersections.map(x => {
    const pointCloudNode = determinePointCloudNode(x.object, nodes);
    if (pointCloudNode === null) {
      throw new Error(`Could not find PointCloudNode for intersected point`);
    }

    const result: IntersectPointCloudNodeResult = {
      distance: x.distance,
      point: x.point,
      pointIndex: x.index!,
      pointCloudNode,
      object: x.object
    };
    return result;
  });
}

function determinePointCloudNode(node: THREE.Object3D, candidates: PointCloudNode[]): PointCloudNode | null {
  while (node.type === 'Points' && node.parent !== null) {
    node = node.parent;
  }
  if (node instanceof Potree.PointCloudOctree) {
    const root: Potree.PointCloudOctreeNode = (node as any).root;
    return candidates.find(x => root.pointcloud === x.potreeNode.octtree) || null;
  }
  return null;
}
