import type { IPointCloudTreeNodeBase } from './IPointCloudTreeNodeBase';
import type { IPointCloudTreeGeometryNode } from '../geometry/IPointCloudTreeGeometryNode';

import type { Points } from 'three';

export interface IPointCloudTreeNode extends IPointCloudTreeNodeBase {
  sceneNode: Points;
  geometryNode: IPointCloudTreeGeometryNode;
  /**
   * Fraction of this node's points to draw, in [0, 1]. 1 means all points. Values below 1 are
   * used to dither the LOD frontier near the point budget so nodes fade in instead of popping.
   */
  keepFraction: number;
}
