import { v3 } from '@cognite/cdf-sdk-singleton';
import { CustomDataNode } from 'src/pages/RevisionDetails/components/TreeView/types';

export function node3dToCustomDataNode(items: v3.Node3D[]): CustomDataNode[] {
  return items.map((item) => {
    return {
      key: item.treeIndex,
      title: item.name || String(item.id),
      meta: item,
      ...(item.subtreeSize <= 1 && { isLeaf: true }),
    };
  });
}
