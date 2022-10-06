/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { IntersectInput } from '@reveal/model-base';
import { PointCloudNode } from './PointCloudNode';

import { PickPoint, PointCloudOctree, PointCloudOctreePicker } from './potree-three-loader';

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

export class PointCloudPickingHandler {
  private readonly _normalized = new THREE.Vector2();
  private readonly _raycaster = new THREE.Raycaster();
  private readonly _picker: PointCloudOctreePicker;

  // To solve https://cognitedata.atlassian.net/browse/REV-523
  private static readonly PickingWindowSize = 5;

  constructor(renderer: THREE.WebGLRenderer) {
    this._picker = new PointCloudOctreePicker(renderer);
  }

  intersectPointClouds(nodes: PointCloudNode[], input: IntersectInput): IntersectPointCloudNodeResult[] {
    const { normalizedCoords, camera } = input;
    this._normalized.set(normalizedCoords.x, normalizedCoords.y);
    this._raycaster.setFromCamera(normalizedCoords, camera);

    const intersections: PickPoint[] = [];

    nodes.forEach(node => {
      const intersection = this._picker.pick(camera, this._raycaster.ray, [node.potreeNode.octree], {
        pickWindowSize: PointCloudPickingHandler.PickingWindowSize
      });
      if (intersection !== null) {
        intersections.push(intersection);
      }
    });

    return intersections
      .sort((x, y) => x.position.distanceTo(camera.position) - y.position.distanceTo(camera.position))
      .filter(x => isPointAcceptedByClippingPlanes(x.position, input.clippingPlanes))
      .map(x => {
        const pointCloudNode = determinePointCloudNode(x.object, nodes);
        if (pointCloudNode === null) {
          throw new Error(`Coulds not find PointCloudNode for intersected point`);
        }

        const result: IntersectPointCloudNodeResult = {
          distance: x.position.distanceTo(camera.position),
          point: x.position,
          pointIndex: x.pointIndex,
          pointCloudNode,
          object: x.object
        };
        return result;
      });
  }
}

function determinePointCloudNode(node: THREE.Object3D, candidates: PointCloudNode[]): PointCloudNode | null {
  while (node.type === 'Points' && node.parent !== null) {
    node = node.parent;
  }
  if (node instanceof PointCloudOctree) {
    return candidates.find(x => node === x.potreeNode.octree) || null;
  }
  return null;
}

function isPointAcceptedByClippingPlanes(point: THREE.Vector3, planes: THREE.Plane[]): boolean {
  let accepted = true;
  for (let i = 0; accepted && i < planes.length; ++i) {
    accepted = planes[i].distanceToPoint(point) >= 0.0;
  }
  return accepted;
}
