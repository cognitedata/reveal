import { Camera, WebGLRenderer } from 'three';
import { LRU } from '../utils/lru';
import { PointCloudOctree } from '../tree/PointCloudOctree';
import { PointCloudObjectProvider } from '../../styling/PointCloudObjectProvider';
import { ClassificationInfo } from '../loading/ClassificationInfo';

export interface IPotree {
  pointBudget: number;
  maxNumNodesLoading: number;
  lru: LRU;

  loadPointCloud(
    baseUrl: string,
    fileName: string,
    stylableObjectInfo: PointCloudObjectProvider
  ): Promise<[PointCloudOctree, ClassificationInfo | undefined]>;

  updatePointClouds(pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer): void;
}
