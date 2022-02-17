import { DataNode } from 'antd/lib/tree';
import {
  CustomDataNode,
  TreeDataNode,
} from 'pages/RevisionDetails/components/TreeView/types';
import { ArrayElement } from 'utils/types';
import { sortNaturally } from 'utils';

/*
  what we do here is moving down one level for each item of branch and list
  to check if everyBranch key exists in the tree
  that's just more performant option than searching for every item in the whole tree
 */
export function hasBranch(list: TreeDataNode[], branchKeys: number[]): boolean {
  if (!branchKeys.length) {
    throw new Error('hasBranch: branchKeys arg must not be empty');
  }

  let i = 0;
  let nextChildren: CustomDataNode[] | undefined = list;

  while (i < branchKeys.length && nextChildren) {
    // eslint-disable-next-line no-loop-func
    const foundNode = nextChildren.find((node) => node.key === branchKeys[i]);
    if (!foundNode) {
      return false;
    }
    nextChildren = foundNode.children;
    i++;
  }

  return i === branchKeys.length;
}

export function getNodeByTreeIndex(
  list: TreeDataNode[] | CustomDataNode[],
  subtreeRootKey: number | undefined
): TreeDataNode {
  let found = list.find((item) => item.key === subtreeRootKey);

  for (let i = 0; i < list.length && !found; i++) {
    if (list[i].children) {
      found = getNodeByTreeIndex(
        list[i].children!,
        subtreeRootKey
      ) as TreeDataNode;
    }
  }

  return found as TreeDataNode;
}

function insertUniqueChildren(
  left: CustomDataNode[],
  right: CustomDataNode[]
): CustomDataNode[] {
  return left
    .concat(
      right.filter(
        (childToAdd) =>
          !left.find((existingNode) => existingNode.key === childToAdd.key)
      )
    )
    .sort((a, b) => {
      // it's totally impossible to have 2 elements without meta (Load more),
      // but left 1,-1,0 for the sake of completeness
      if (!('meta' in a) || !('meta' in b)) {
        if (!('meta' in a)) {
          return 1;
        }
        if (!('meta' in b)) {
          return -1;
        }
        return 0;
      }
      return sortNaturally(a.meta.name, b.meta.name);
    });
}

export function addChildrenIntoTree(
  list: TreeDataNode[] | CustomDataNode[],
  subtreeRootId: number | undefined,
  children: CustomDataNode[]
): TreeDataNode[] | CustomDataNode[] {
  if (subtreeRootId === undefined) {
    return insertUniqueChildren(list, children);
  }

  return list.map((node) => {
    if (node.key === subtreeRootId) {
      return {
        ...node,
        children: insertUniqueChildren(node.children || [], children),
      };
    }
    if (node.children) {
      return {
        ...node,
        children: addChildrenIntoTree(node.children, subtreeRootId, children),
      };
    }
    return node;
  });
}

export function removeNodeFromTree<T extends DataNode>(
  list: T[],
  nodeKey: string | number
): T[] {
  const index = list.findIndex((item) => item.key === nodeKey);
  if (index > -1) {
    if (index === 0) {
      return list.slice(1);
    }
    return list.slice(0, index).concat(list.slice(index + 1));
  }

  return list.map((item) => {
    if (item.children) {
      return {
        ...item,
        children: removeNodeFromTree(item.children, nodeKey),
      };
    }
    return item;
  });
}

export function updateNodeById<T extends TreeDataNode | CustomDataNode>(
  list: T[],
  nodeKey: ArrayElement<T['children']>['key'],
  overrides: Partial<T>
): ArrayElement<typeof list>[] {
  const index = list.findIndex((item) => item.key === nodeKey);

  if (index > -1) {
    return list.map((item) => {
      if (item.key === nodeKey) {
        return {
          ...item,
          ...overrides,
        };
      }
      return item;
    });
  }

  return list.map((item) => {
    if (item.children) {
      return {
        ...item,
        children: updateNodeById(item.children, nodeKey, overrides),
      };
    }
    return item;
  });
}

export function getAncestors(
  list: CustomDataNode[],
  key: number,
  branch: number[] = []
): number[] | undefined {
  for (let i = 0; i < list.length; i++) {
    if (list[i].key === key) {
      return [list[i].key as number].concat(branch);
    }
  }

  for (let i = 0; i < list.length; i++) {
    const { children } = list[i];
    if (children) {
      const childBranch = getAncestors(children, key, branch);
      if (childBranch) {
        return branch.concat(list[i].key as number, childBranch);
      }
    }
  }

  return undefined;
}

/**
 * Iterate over every node of passed tree with ability to skip branches.
 * Branch iteration can be skipped if callback returns `false`.
 * @param treeData
 * @param callback
 */
export function traverseTree(
  treeData: TreeDataNode[] | CustomDataNode[],
  callback: (
    key: typeof node['key'],
    node: ArrayElement<typeof treeData>
  ) => boolean | void
) {
  treeData.forEach((dataNode) => {
    const { key, children } = dataNode;
    if (callback(key, dataNode) !== false) {
      traverseTree(children || [], callback);
    }
  });
}
