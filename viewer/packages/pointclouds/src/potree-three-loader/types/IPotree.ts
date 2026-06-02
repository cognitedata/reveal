import type { Camera, WebGLRenderer } from 'three';
import type { LRU } from '../utils/lru';
import type { PointCloudOctree } from '../tree/PointCloudOctree';
import type { StylableObject } from '@reveal/data-providers';

export interface IPotree {
  pointBudget: number;
  maxNumNodesLoading: number;
  lru: LRU;

  loadPointCloud(
    baseUrl: string,
    fileName: string,
    stylableObject: StylableObject[],
    modelIdentifier: symbol
  ): Promise<PointCloudOctree>;

  updatePointClouds(pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer): void;
}
