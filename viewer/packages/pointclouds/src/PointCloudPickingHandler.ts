/*!
 * Copyright 2021 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import { Raycaster, Vector2 } from 'three';

import type { IntersectInput } from '@reveal/model-base';
import type { PointCloudNode } from './PointCloudNode';
import { Mutex } from 'async-mutex';

import type { PickPoint } from './potree-three-loader';
import { PointCloudOctreePicker } from './potree-three-loader';
import { isPointVisibleByPlanes } from '@reveal/utilities';
import type { ClassicDataSourceType, DMDataSourceType, DataSourceType } from '@reveal/data-providers';
import { isClassicPointCloudVolume, isDMPointCloudVolume } from '@reveal/data-providers';
import type { IntersectPointCloudNodeResult } from './types';

export class PointCloudPickingHandler {
  private readonly _normalized = new Vector2();
  private readonly _raycaster = new Raycaster();
  private readonly _picker: PointCloudOctreePicker;
  private readonly _mutex = new Mutex();

  // To solve https://cognitedata.atlassian.net/browse/REV-523
  private static readonly PickingWindowSize = 5;

  constructor(renderer: WebGLRenderer) {
    this._picker = new PointCloudOctreePicker(renderer);
  }

  dispose(): void {
    this._picker.dispose();
  }

  async intersectPointClouds(
    nodes: PointCloudNode<DataSourceType>[],
    input: IntersectInput
  ): Promise<IntersectPointCloudNodeResult<DataSourceType>[]> {
    const { normalizedCoords, camera } = input;
    this._normalized.set(normalizedCoords.x, normalizedCoords.y);
    this._raycaster.setFromCamera(normalizedCoords, camera);

    const release = await this._mutex.acquire();
    try {
      const intersections: { node: PointCloudNode<DataSourceType>; pick: PickPoint }[] = [];

      // Get PointCloudNodes which are visible.
      const visibleNodes = nodes.filter(node => node.visible);

      for (const node of visibleNodes) {
        const pick = await this._picker.pick(camera, this._raycaster.ray, [node.octree], {
          pickWindowSize: PointCloudPickingHandler.PickingWindowSize
        });
        if (pick !== null) {
          intersections.push({ node, pick });
        }
      }

      return intersections
        .filter(({ pick }) => isPointVisibleByPlanes(input.clippingPlanes, pick.position))
        .sort((a, b) => a.pick.position.distanceTo(camera.position) - b.pick.position.distanceTo(camera.position))
        .map(({ node: pointCloudNode, pick: x }) => {
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
                  assetRef: pointCloudObject.assetRef,
                  instanceRef: pointCloudObject.instanceRef
                }
              };

              return result;
            } else if (isDMPointCloudVolume(pointCloudObject)) {
              const result: IntersectPointCloudNodeResult<DMDataSourceType> = {
                ...baseObject,
                pointCloudNode: pointCloudNode as PointCloudNode<DMDataSourceType>,
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
    } finally {
      release();
    }
  }
}
