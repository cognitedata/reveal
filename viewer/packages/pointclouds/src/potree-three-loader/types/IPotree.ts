import type { Camera, WebGLRenderer } from 'three';
import type { LRU } from '../utils/lru';
import type { PointCloudOctree } from '../tree/PointCloudOctree';
import type { ModelIdentifier, StylableObject } from '@reveal/data-providers';
import type { MetadataWithSignedFiles } from '@reveal/data-providers/src/metadata-providers/types';
import type { EptJson } from '../loading/EptJson';

export interface IPotree {
  pointBudget: number;
  maxNumNodesLoading: number;
  lru: LRU;

  loadPointCloud(
    baseUrl: string,
    fileName: string,
    stylableObject: StylableObject[],
    modelIdentifier: ModelIdentifier,
    signedFilesBaseUrl?: string,
    preloadedEptData?: MetadataWithSignedFiles<EptJson>
  ): Promise<PointCloudOctree>;

  updatePointClouds(pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer): void;
}
