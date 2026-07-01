import type { Camera, WebGLRenderer } from 'three';
import type { LRU } from '../utils/lru';
import type { PointCloudOctree } from '../tree/PointCloudOctree';
import type { ModelIdentifier, StylableObject } from '@reveal/data-providers';
import type { PointCloudMetadataWithSignedFiles } from '../../types';

export interface IPotree {
  pointBudget: number;
  maxNumNodesLoading: number;
  lru: LRU;

  loadPointCloud(
    baseUrl: string,
    signedFilesBaseUrl: string,
    fileName: string,
    stylableObject: StylableObject[],
    modelIdentifier: ModelIdentifier,
    preloadedEptData?: PointCloudMetadataWithSignedFiles
  ): Promise<PointCloudOctree>;

  updatePointClouds(pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer): void;
}
