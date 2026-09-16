import type { IPointCloudTreeNodeBase } from '../tree/IPointCloudTreeNodeBase';

import type { Box3, Vector3 } from 'three';

export interface IPointCloudTreeGeometry {
  root: IPointCloudTreeNodeBase | undefined;

  boundingBox: Box3;
  tightBoundingBox: Box3;

  offset: Vector3;
  spacing: number;

  dispose(): void;
}
