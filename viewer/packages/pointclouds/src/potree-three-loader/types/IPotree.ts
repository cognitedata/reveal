/*!
 * Copyright 2022 Cognite AS
 */
import { Camera, WebGLRenderer } from 'three';
import { GetUrlFn, XhrRequest } from '../loading/types';
import { LRU } from '../utils/lru';
import { PointCloudOctree } from '../tree/PointCloudOctree';
import { IVisibilityUpdateResult } from './IVisibilityUpdateResult';

export interface IPotree {
  pointBudget: number;
  maxNumNodesLoading: number;
  lru: LRU;

  loadPointCloud(url: string, getUrl: GetUrlFn, xhrRequest?: XhrRequest): Promise<PointCloudOctree>;

  updatePointClouds(pointClouds: PointCloudOctree[], camera: Camera, renderer: WebGLRenderer): IVisibilityUpdateResult;
}
