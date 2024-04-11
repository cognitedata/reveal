import { IPointCloudTreeNodeBase } from './IPointCloudTreeNodeBase';
import { IPointCloudTreeGeometryNode } from '../geometry/IPointCloudTreeGeometryNode';

import * as THREE from 'three';

export type IPointCloudTreeNode = {
  sceneNode: THREE.Points;
  geometryNode: IPointCloudTreeGeometryNode;
} & IPointCloudTreeNodeBase;
