/*!
 * Copyright 2022 Cognite AS
 */

import { IPointCloudTreeNodeBase } from './IPointCloudTreeNodeBase';
import { IPointCloudTreeGeometryNode } from './IPointCloudTreeGeometryNode';

import * as THREE from 'three';

export interface IPointCloudTreeNode extends IPointCloudTreeNodeBase {
  sceneNode: THREE.Points;
  geometryNode: IPointCloudTreeGeometryNode;
};
