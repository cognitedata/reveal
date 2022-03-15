/*!
 * Copyright 2022 Cognite AS
 */
import { Vector3 } from 'three';
import { PointCloudOctree } from '../tree/PointCloudOctree';

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
