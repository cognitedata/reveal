import { Vector3 } from 'three';
import { PointCloudOctree } from '../tree/PointCloudOctree';

export interface PickPoint {
  pointIndex: number;
  object: THREE.Object3D;
  position: Vector3;
  normal?: Vector3;
  pointCloud?: PointCloudOctree;
  [property: string]: any;
}

export interface PointCloudHit {
  pIndex: number;
  pcIndex: number;
}
