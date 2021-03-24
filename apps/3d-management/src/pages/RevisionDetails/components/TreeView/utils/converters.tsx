import React from 'react';
import { TreeDataNode } from 'src/pages/RevisionDetails/components/TreeView/types';
import { SelectedNode } from 'src/store/modules/TreeView';
import { v3 } from '@cognite/cdf-sdk-singleton';
import { NodeWithInfoButton } from 'src/pages/RevisionDetails/components/TreeView/NodeWithInfoButton';

export function treeDataNodeToSelectedNode(node: TreeDataNode): SelectedNode {
  return {
    treeIndex: node.meta.treeIndex,
    subtreeSize: node.meta.subtreeSize,
    nodeId: node.meta.id,
  };
}

export function node3dToTreeDataNode(items: v3.Node3D[]): TreeDataNode[] {
  return items.map((item) => {
    return {
      key: item.treeIndex,
      title: <NodeWithInfoButton name={item.name || String(item.id)} />,
      meta: item,
      ...(item.subtreeSize <= 1 && { isLeaf: true }),
    };
  });
}
