/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { IntersectInput } from '@reveal/model-base';
import { PointCloudNode } from './PointCloudNode';

import { PickPoint, PointCloudOctree, PointCloudOctreePicker } from './potree-three-loader';
import { AnnotationsAssetRef } from '@cognite/sdk';
import { isPointVisibleByPlanes } from '@reveal/utilities';

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
  /**
   * annotationId of the clicked object within a pointcloud.
   */
  annotationId: number;
  /**
   * asset reference of the clicked object in the pointcloud, if any.
   */
  assetRef?: AnnotationsAssetRef;
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

  dispose(): void {
    this._picker.dispose();
  }

  intersectPointClouds(nodes: PointCloudNode[], input: IntersectInput): IntersectPointCloudNodeResult[] {
    const { normalizedCoords, camera } = input;
    this._normalized.set(normalizedCoords.x, normalizedCoords.y);
    this._raycaster.setFromCamera(normalizedCoords, camera);

    const intersections: PickPoint[] = [];

    nodes.forEach(node => {
      const intersection = this._picker.pick(camera, this._raycaster.ray, [node.octree], {
        pickWindowSize: PointCloudPickingHandler.PickingWindowSize
      });
      if (intersection !== null) {
        intersections.push(intersection);
      }
    });

    return intersections
      .sort((x, y) => x.position.distanceTo(camera.position) - y.position.distanceTo(camera.position))
      .filter(x => isPointVisibleByPlanes(input.clippingPlanes, x.position))
      .map(x => {
        const pointCloudNode = determinePointCloudNode(x.object, nodes);
        if (pointCloudNode === null) {
          throw new Error(`Coulds not find PointCloudNode for intersected point`);
        }

        const pointCloudObject = pointCloudNode.getStylableObjectMetadata(x.objectId);
        const [annotationId, asset] =
          pointCloudObject !== undefined ? [pointCloudObject.annotationId, pointCloudObject.assetRef] : [0, undefined];

        const result: IntersectPointCloudNodeResult = {
          distance: x.position.distanceTo(camera.position),
          point: x.position,
          pointIndex: x.pointIndex,
          pointCloudNode,
          object: x.object,
          annotationId: annotationId,
          assetRef: asset
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
    return candidates.find(x => node === x.octree) || null;
  }
  return null;
}
