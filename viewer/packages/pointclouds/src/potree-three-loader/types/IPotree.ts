import { Camera, WebGLRenderer } from 'three';
import { LRU } from '../utils/lru';
import { PointCloudOctree } from '../tree/PointCloudOctree';
import { IVisibilityUpdateResult } from './IVisibilityUpdateResult';
import { PointCloudObjectProvider } from '../../styling/PointCloudObjectProvider';
import { ClassDefinition } from '../loading/ClassDefinition';

export interface IPotree {
  pointBudget: number;
  maxNumNodesLoading: number;
  lru: LRU;

  loadPointCloud(
    baseUrl: string,
    fileName: string,
    stylableObjectInfo: PointCloudObjectProvider
  ): Promise<[PointCloudOctree, ClassDefinition | undefined]>;

  updatePointClouds(pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer): IVisibilityUpdateResult;
}
