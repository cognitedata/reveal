import {
  CustomDataNode,
  TreeDataNode,
} from 'src/pages/RevisionDetails/components/TreeView/types';
import { SelectedNode, TreeIndex } from 'src/store/modules/TreeView';
import { ArrayElement } from 'src/utils/types';

enum Record {
  None,
  Start,
  End,
}

/**
 * Iterate over every node of passed tree with ability to skip branches.
 * Branch iteration can be skipped if callback returns `false`.
 * @param treeData
 * @param callback
 */
export function traverseNodesKey(
  treeData: TreeDataNode[] | CustomDataNode[],
  callback: (
    key: typeof node['key'],
    node: ArrayElement<typeof treeData>
  ) => boolean | void
) {
  treeData.forEach((dataNode) => {
    const { key, children } = dataNode;
    if (callback(key, dataNode) !== false) {
      traverseNodesKey(children || [], callback);
    }
  });
}

export function calcRangeKeys({
  treeData,
  expandedKeys,
  startKey,
  endKey,
}: {
  treeData: Array<TreeDataNode>;
  expandedKeys: Array<TreeIndex>;
  startKey?: TreeIndex;
  endKey?: TreeIndex;
}): Array<TreeIndex> {
  const keys: Array<TreeIndex> = [];
  let record: Record = Record.None;

  if (startKey != null && startKey === endKey) {
    return [startKey];
  }
  if (startKey == null || endKey == null) {
    return [];
  }

  function matchKey(key: TreeIndex) {
    return key === startKey || key === endKey;
  }

  traverseNodesKey(treeData, (key: TreeIndex | string) => {
    if (record === Record.End || typeof key !== 'number') {
      return false;
    }

    if (matchKey(key)) {
      keys.push(key);

      if (record === Record.None) {
        record = Record.Start;
      } else if (record === Record.Start) {
        record = Record.End;
        return false;
      }
    } else if (record === Record.Start) {
      keys.push(key);
    }

    return expandedKeys.includes(key);
  });

  return keys;
}

export function convertKeysToNodes(
  treeData: Array<TreeDataNode>,
  keys: Array<TreeIndex>
): Array<TreeDataNode> {
  const restKeys: Array<TreeIndex> = [...keys];
  const nodes: Array<TreeDataNode> = [];

  traverseNodesKey(treeData, (key, node) => {
    if (typeof key !== 'number') {
      return false;
    }
    const index = restKeys.indexOf(key);
    if (index !== -1) {
      nodes.push(node as TreeDataNode);
      restKeys.splice(index, 1);
    }

    return !!restKeys.length;
  });

  return nodes;
}

export function convertKeysToSelectedNodes(
  treeData: Array<TreeDataNode>,
  keys: Array<TreeIndex>
): Array<SelectedNode> {
  return convertKeysToNodes(treeData, keys).map((n) => ({
    treeIndex: n.key,
    nodeId: n.meta.id,
    subtreeSize: n.meta.subtreeSize,
  }));
}
