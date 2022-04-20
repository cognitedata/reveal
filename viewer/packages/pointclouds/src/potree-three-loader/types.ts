import { Camera, Vector3, WebGLRenderer } from 'three';
import { GetUrlFn, XhrRequest } from './loading/types';
import { LRU } from './utils/lru';
import { PointCloudOctree } from './PointCloudOctree';
import { IPointCloudTreeNodeBase } from './types/IPointCloudTreeNodeBase';

export interface IVisibilityUpdateResult {
  visibleNodes: IPointCloudTreeNodeBase[];
  numVisiblePoints: number;
  /**
   * True when a node has been loaded but was not added to the scene yet.
   * Make sure to call updatePointClouds() again on the next frame.
   */
  exceededMaxLoadsToGPU: boolean;
  /**
   * True when at least one node in view has failed to load.
   */
  nodeLoadFailed: boolean;
  /**
   * Promises for loading nodes, will reject when loading fails.
   */
  nodeLoadPromises: Promise<void>[];
}

export interface IPotree {
  pointBudget: number;
  maxNumNodesLoading: number;
  lru: LRU;

  loadPointCloud(url: string, getUrl: GetUrlFn, xhrRequest?: XhrRequest): Promise<PointCloudOctree>;

  updatePointClouds(
    pointClouds: PointCloudOctree[],
    camera: Camera,
    renderer: WebGLRenderer,
  ): IVisibilityUpdateResult;
}

export interface PickPoint {
  position?: Vector3;
  normal?: Vector3;
  pointCloud?: PointCloudOctree;
  [property: string]: any;
}

export interface PointCloudHit {
  pIndex: number;
  pcIndex: number;
}
