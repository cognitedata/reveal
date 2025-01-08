/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { IntersectInput } from '@reveal/model-base';
import { PointCloudNode } from './PointCloudNode';

import { PickPoint, PointCloudOctree, PointCloudOctreePicker } from './potree-three-loader';
import { isPointVisibleByPlanes } from '@reveal/utilities';
import {
  ClassicDataSourceType,
  CoreDMDataSourceType,
  isClassicPointCloudVolume,
  isDMPointCloudVolume,
  DataSourceType
} from '@reveal/data-providers';
import { IntersectPointCloudNodeResult } from './types';

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

  intersectPointClouds(
    nodes: PointCloudNode<DataSourceType>[],
    input: IntersectInput
  ): IntersectPointCloudNodeResult<DataSourceType>[] {
    const { normalizedCoords, camera } = input;
    this._normalized.set(normalizedCoords.x, normalizedCoords.y);
    this._raycaster.setFromCamera(normalizedCoords, camera);

    const intersections: PickPoint[] = [];

    // Get PointCloudNodes which are visible.
    const visibleNodes = nodes.filter(node => node.visible);

    visibleNodes.forEach(node => {
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
        const pointCloudNode = determinePointCloudNode(x.object, visibleNodes);
        if (pointCloudNode === null) {
          throw new Error(`Could not find PointCloudNode for intersected point`);
        }

        const pointCloudObject = pointCloudNode.getStylableObjectMetadata(x.objectId);

        const baseObject = {
          distance: x.position.distanceTo(camera.position),
          point: x.position,
          pointIndex: x.pointIndex,
          pointCloudNode,
          object: x.object
        };

        if (pointCloudObject !== undefined) {
          if (isClassicPointCloudVolume(pointCloudObject)) {
            const result: IntersectPointCloudNodeResult<ClassicDataSourceType> = {
              ...baseObject,
              pointCloudNode: pointCloudNode as PointCloudNode<ClassicDataSourceType>,
              volumeMetadata: {
                annotationId: pointCloudObject.annotationId,
                assetRef: pointCloudObject.assetRef
              }
            };

            return result;
          } else if (isDMPointCloudVolume(pointCloudObject)) {
            const result: IntersectPointCloudNodeResult<CoreDMDataSourceType> = {
              ...baseObject,
              pointCloudNode: pointCloudNode as PointCloudNode<CoreDMDataSourceType>,
              volumeMetadata: {
                volumeInstanceRef: pointCloudObject.volumeInstanceRef,
                assetRef: pointCloudObject.assetRef
              }
            };

            return result;
          } else {
            throw new Error('Unknown point cloud object type');
          }
        }

        return baseObject;
      });
  }
}

function determinePointCloudNode(
  node: THREE.Object3D,
  candidates: PointCloudNode<DataSourceType>[]
): PointCloudNode<DataSourceType> | null {
  while (node.type === 'Points' && node.parent !== null) {
    node = node.parent;
  }
  if (node instanceof PointCloudOctree) {
    return candidates.find(x => node === x.octree) || null;
  }
  return null;
}
