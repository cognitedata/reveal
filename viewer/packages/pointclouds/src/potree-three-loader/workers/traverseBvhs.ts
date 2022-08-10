/*!
 * Copyright 2022 Cognite AS
 */

import { BoundingVolumeHierarchy } from '../../bvh/BoundingVolumeHierarchy';
import { StylableObjectBvhElement } from './StylableObjectBvhElement';
import { PointOctree } from '../../pointOctree/PointOctree';
import { OctreeNode } from '../../pointOctree/OctreeNode';
import { BvhNode } from '../../bvh/BvhNode';

import * as THREE from 'three';

const helpVec = new THREE.Vector3();

function traverseBvhNodes(octreeNode: OctreeNode, bvhNode: BvhNode<StylableObjectBvhElement>, objectIds: Uint16Array) {
  if (octreeNode.children && bvhNode.children) {
    for (const octreeChild of octreeNode.children) {
      for (const bvhChild of bvhNode.children) {
        if (octreeChild.boundingBox.intersectsBox(bvhChild.boundingBox)) {
          traverseBvhNodes(octreeChild, bvhChild, objectIds);
        }
      }
    }

    return;
  }

  if (octreeNode.children) {
    for (const octreeChild of octreeNode.children) {
      if (octreeChild.boundingBox.intersectsBox(bvhNode.boundingBox)) {
        traverseBvhNodes(octreeChild, bvhNode, objectIds);
      }
    }

    return;
  }

  if (bvhNode.children) {
    for (const bvhChild of bvhNode.children) {
      if (octreeNode.boundingBox.intersectsBox(bvhChild.boundingBox)) {
        traverseBvhNodes(octreeNode, bvhChild, objectIds);
      }
    }

    return;
  }

  for (const point of octreeNode.points!) {
    helpVec.fromArray(point);
    for (const obj of bvhNode.elements!) {
      if (obj.stylableObject.shape.containsPoint(helpVec)) {
        objectIds[point[3]] = obj.stylableObject.objectId;
        break;
      }
    }
  }
}

export function traverseBvhs(
  octree: PointOctree,
  bvh: BoundingVolumeHierarchy<StylableObjectBvhElement>,
  objectIds: Uint16Array
): void {
  traverseBvhNodes(octree.root, bvh.root, objectIds);
}
