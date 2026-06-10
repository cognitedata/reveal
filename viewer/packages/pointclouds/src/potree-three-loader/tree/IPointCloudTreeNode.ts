import type { IPointCloudTreeNodeBase } from './IPointCloudTreeNodeBase';
import type { IPointCloudTreeGeometryNode } from '../geometry/IPointCloudTreeGeometryNode';

import type { Points } from 'three';

export interface IPointCloudTreeNode extends IPointCloudTreeNodeBase {
  sceneNode: Points;
  geometryNode: IPointCloudTreeGeometryNode;
}
