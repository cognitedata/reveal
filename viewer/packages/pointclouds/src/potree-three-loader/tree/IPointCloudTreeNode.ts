import { IPointCloudTreeNodeBase } from './IPointCloudTreeNodeBase';
import { IPointCloudTreeGeometryNode } from '../geometry/IPointCloudTreeGeometryNode';

import * as THREE from 'three';

export interface IPointCloudTreeNode extends IPointCloudTreeNodeBase {
  sceneNode: THREE.Points;
  geometryNode: IPointCloudTreeGeometryNode;
  traverseOctreeNodes(
    callback: (node: IPointCloudTreeNode) => void,
    includeSelf?: boolean,
    pruneSubTree?: (node: IPointCloudTreeNode) => boolean
  ): void;
}
