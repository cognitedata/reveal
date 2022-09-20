import { Camera, WebGLRenderer } from 'three';
import { LRU } from '../utils/lru';
import { PointCloudOctree } from '../tree/PointCloudOctree';
import { ClassificationInfo } from '../loading/ClassificationInfo';
import { PointCloudObjectAnnotationData } from '../../styling/PointCloudObjectAnnotationData';

export interface IPotree {
  pointBudget: number;
  maxNumNodesLoading: number;
  lru: LRU;

  loadPointCloud(
    baseUrl: string,
    fileName: string,
    stylableObjectInfo: PointCloudObjectAnnotationData
  ): Promise<[PointCloudOctree, ClassificationInfo | undefined]>;

  updatePointClouds(pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer): void;
}
