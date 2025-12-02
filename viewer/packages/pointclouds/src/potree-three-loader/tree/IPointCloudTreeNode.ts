import { IPointCloudTreeNodeBase } from './IPointCloudTreeNodeBase';
import { IPointCloudTreeGeometryNode } from '../geometry/IPointCloudTreeGeometryNode';

import * as THREE from 'three';

/**
 * Fade state for smooth node appearance animation.
 * Stored per-node to avoid race conditions with shared material.
 */
export interface NodeFadeState {
  opacity: number;
}

export interface IPointCloudTreeNode extends IPointCloudTreeNodeBase {
  sceneNode: THREE.Points;
  geometryNode: IPointCloudTreeGeometryNode;
  fadeOpacity?: NodeFadeState;
}
