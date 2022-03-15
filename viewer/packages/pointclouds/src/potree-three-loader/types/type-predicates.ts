/*!
 * Copyright 2022 Cognite AS
 */
import { IPointCloudTreeNodeBase } from '../tree/IPointCloudTreeNodeBase';
import { IPointCloudTreeGeometryNode } from '../tree/geometry/IPointCloudTreeGeometryNode';
import { IPointCloudTreeNode } from '../tree/IPointCloudTreeNode';

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
