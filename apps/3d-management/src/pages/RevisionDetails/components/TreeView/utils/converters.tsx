import React from 'react';

import { Node3D } from '@cognite/sdk';

import { SelectedNode } from '../../../../../store/modules/TreeView';
import { NodeWithInfoButton } from '../NodeWithInfoButton';
import { TreeDataNode } from '../types';

export function treeDataNodeToSelectedNode(node: TreeDataNode): SelectedNode {
  return {
    treeIndex: node.meta.treeIndex,
    subtreeSize: node.meta.subtreeSize,
    nodeId: node.meta.id,
  };
}

export function node3dToTreeDataNode(items: Node3D[]): TreeDataNode[] {
  return items.map((item) => {
    return {
      key: item.treeIndex,
      title: <NodeWithInfoButton name={item.name || String(item.id)} />,
      meta: item,
      ...(item.subtreeSize <= 1 && { isLeaf: true }),
    };
  });
}
