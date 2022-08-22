import { Camera, WebGLRenderer } from 'three';
import { LRU } from '../utils/lru';
import { PointCloudOctree } from '../tree/PointCloudOctree';

export interface IPotree {
  pointBudget: number;
  maxNumNodesLoading: number;
  lru: LRU;

  loadPointCloud(baseUrl: string, fileName: string): Promise<PointCloudOctree>;

  updatePointClouds(pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer): void;
}
