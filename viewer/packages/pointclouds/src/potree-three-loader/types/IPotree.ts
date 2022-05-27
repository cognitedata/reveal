import { Camera, WebGLRenderer } from 'three';
import { LRU } from '../utils/lru';
import { PointCloudOctree } from '../tree/PointCloudOctree';
import { IVisibilityUpdateResult } from './IVisibilityUpdateResult';
import { StylableObjectInfo } from '../../styling/StylableObjectInfo';

export interface IPotree {
  pointBudget: number;
  maxNumNodesLoading: number;
  lru: LRU;

  loadPointCloud(
    baseUrl: string,
    fileName: string,
    stylableObjectInfo?: StylableObjectInfo | undefined
  ): Promise<PointCloudOctree>;

  updatePointClouds(pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer): IVisibilityUpdateResult;
}
