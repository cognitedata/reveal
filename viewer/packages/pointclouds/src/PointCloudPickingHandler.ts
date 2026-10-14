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
import type { EdlOptions } from '@reveal/rendering';
import { POINT_SIZE_REFERENCE_SCREEN_HEIGHT, shouldApplyEdl } from '@reveal/rendering';

export class PointCloudPickingHandler {
  private readonly _normalized = new Vector2();
  private readonly _drawingBufferSize = new Vector2();
  private readonly _raycaster = new Raycaster();
  private readonly _renderer: WebGLRenderer;
  private readonly _picker: PointCloudOctreePicker;
  private readonly _edlOptions: EdlOptions | undefined;
  private readonly _mutex = new Mutex();

  // To solve https://cognitedata.atlassian.net/browse/REV-523
  private static readonly PickingWindowSize = 5;
  // Covers the max EDL radius (5) on a 4320px high drawing buffer (8K display): 2 * ceil(5 * 4320 / 1080) + 1.
  private static readonly MaxPickingWindowSize = 41;

  /**
   * @param renderer Renderer used for the pick render.
   * @param edlOptions EDL options the point clouds are rendered with, if any. EDL shades empty pixels
   * within its radius of a point, closing small gaps on screen that the pick render (which has no EDL)
   * still sees as empty, so the pick window is widened to cover that radius.
   */
  constructor(renderer: WebGLRenderer, edlOptions?: EdlOptions) {
    this._renderer = renderer;
    this._picker = new PointCloudOctreePicker(renderer);
    this._edlOptions = edlOptions;
  }

  dispose(): void {
    this._picker.dispose();
  }

  /**
   * Invalidates the picker's cached full-frame pick buffer. Must be called whenever a new
   * frame of the scene is rendered.
   */
  invalidatePickCache(): void {
    this._picker.invalidateCache();
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
      // Get PointCloudNodes which are visible.
      const visibleNodes = nodes.filter(node => node.visible);
      if (visibleNodes.length === 0) {
        return [];
      }

      // Pass all visible octrees to a single pick() call. PointCloudOctreePickerHelper.render()
      // renders all octrees in one GPU pass using per-node index offsets, then does a single
      // async GPU readback — reducing cost from N × readback to 1 × readback regardless of
      // how many point clouds are in the scene.
      const allOctrees = visibleNodes.map(n => n.octree);
      const pick = await this._picker.pick(camera, this._raycaster.ray, allOctrees, {
        pickWindowSize: this.getPickWindowSize(),
        cameraInMotion: input.cameraInMotion ?? false,
        forceWindowedPick: input.forceWindowedPick ?? false
      });

      if (pick === null || !isPointVisibleByPlanes(input.clippingPlanes, pick.position)) {
        return [];
      }

      const pointCloudNode = visibleNodes.find(n => n.octree === pick.pointCloud);
      if (pointCloudNode === undefined) {
        return [];
      }

      return [mapPickResult(pointCloudNode, pick, camera)];
    } finally {
      release();
    }
  }

  /**
   * Pick window size in drawing buffer pixels. Odd, so the window is centered on the pick position.
   */
  private getPickWindowSize(): number {
    if (this._edlOptions === undefined || !shouldApplyEdl(this._edlOptions)) {
      return PointCloudPickingHandler.PickingWindowSize;
    }
    // The EDL radius is given in pixels at the reference screen height, like point sizes.
    const { y: drawingBufferHeight } = this._renderer.getDrawingBufferSize(this._drawingBufferSize);
    const edlRadiusPixels = (this._edlOptions.radius * drawingBufferHeight) / POINT_SIZE_REFERENCE_SCREEN_HEIGHT;
    const windowSize = 2 * Math.ceil(edlRadiusPixels) + 1;
    return Math.min(
      PointCloudPickingHandler.MaxPickingWindowSize,
      Math.max(PointCloudPickingHandler.PickingWindowSize, windowSize)
    );
  }
}

function mapPickResult(
  pointCloudNode: PointCloudNode<DataSourceType>,
  x: PickPoint,
  camera: IntersectInput['camera']
): IntersectPointCloudNodeResult<DataSourceType> {
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
}
