import { IPointCloudTreeNodeBase } from '../tree/IPointCloudTreeNodeBase';

import * as THREE from 'three';

export interface IPointCloudTreeGeometry {
  root: IPointCloudTreeNodeBase | undefined;

  boundingBox: THREE.Box3;
  tightBoundingBox: THREE.Box3;

  offset: THREE.Vector3;
  spacing: number;

  dispose(): void;
}
