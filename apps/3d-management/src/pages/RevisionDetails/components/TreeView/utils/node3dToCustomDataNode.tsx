import React from 'react';
import { v3 } from '@cognite/cdf-sdk-singleton';
import { CustomDataNode } from 'src/pages/RevisionDetails/components/TreeView/types';
import { NodeWithInfoButton } from 'src/pages/RevisionDetails/components/TreeView/NodeWithInfoButton';

export function node3dToCustomDataNode(items: v3.Node3D[]): CustomDataNode[] {
  return items.map((item) => {
    return {
      key: item.treeIndex,
      title: <NodeWithInfoButton name={item.name || String(item.id)} />,
      meta: item,
      ...(item.subtreeSize <= 1 && { isLeaf: true }),
    };
  });
}
