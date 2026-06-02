import type { IPointCloudTreeNodeBase } from './IPointCloudTreeNodeBase';
import type { IPointCloudTreeGeometryNode } from '../geometry/IPointCloudTreeGeometryNode';

import type * as THREE from 'three';

export interface IPointCloudTreeNode extends IPointCloudTreeNodeBase {
  sceneNode: THREE.Points;
  geometryNode: IPointCloudTreeGeometryNode;
}
