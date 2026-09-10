import type { IPointCloudTreeNodeBase } from '../tree/IPointCloudTreeNodeBase';
import type { IPointCloudTreeGeometryNode } from '../geometry/IPointCloudTreeGeometryNode';
import type { IPointCloudTreeNode } from '../tree/IPointCloudTreeNode';

export function isGeometryNode(node?: any): node is IPointCloudTreeGeometryNode {
  return node !== undefined && node !== null && node.isGeometryNode;
}

export function isTreeNode(node?: IPointCloudTreeNodeBase): node is IPointCloudTreeNode {
  return node !== undefined && node !== null && node.isTreeNode;
}

// Equivalent to (!node || isTreeNode(node))
export function isOptionalTreeNode(node?: IPointCloudTreeNodeBase): node is IPointCloudTreeNode | undefined {
  return !node || node.isTreeNode;
}
