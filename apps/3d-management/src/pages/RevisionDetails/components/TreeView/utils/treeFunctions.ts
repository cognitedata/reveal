import { DataNode } from 'antd-v4/lib/tree';
import { TreeDataNode } from 'src/pages/RevisionDetails/components/TreeView/types';

type KeyAndTitle = {
  key: string | number;
  title: Pick<TreeDataNode, 'title'>['title'];
};
export type BasicTree<T extends KeyAndTitle = KeyAndTitle> = T & {
  children?: Array<BasicTree<T>>;
};

/*
  what we do here is moving down one level for each item of branch and list
  to check if everyBranch key exists in the tree
  that's just more performant option than searching for every item in the whole tree
 */
export function hasBranch<T extends DataNode>(
  list: T[],
  branchKeys: number[]
): boolean {
  if (!branchKeys.length) {
    throw new Error('hasBranch: branchKeys arg must not be empty');
  }

  let i = 0;
  let nextChildren: T[] | undefined = list;

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

export function getNodeByTreeIndex<T extends DataNode>(
  list: T[],
  subtreeRootId: number | undefined
): T | undefined {
  let found = list.find((item) => item.key === subtreeRootId);

  for (let i = 0; i < list.length && !found; i++) {
    if (list[i].children) {
      found = getNodeByTreeIndex(list[i].children!, subtreeRootId) as T;
    }
  }
  return found;
}

function insertUniqueChildren<T extends KeyAndTitle>(
  left: T[],
  right: T[]
): T[] {
  return left
    .concat(
      right.filter(
        (childToAdd) =>
          !left.find((existingNode) => existingNode.key === childToAdd.key)
      )
    )
    .sort((a, b) => {
      if (a.title === b.title) {
        return 0;
      }
      return a.title < b.title ? -1 : 1;
    });
}

export function addChildrenIntoTree<
  T extends BasicTree<KeyAndTitle> = BasicTree<KeyAndTitle>
>(list: T[], subtreeRootId: number | undefined, children: T[]): T[] {
  if (subtreeRootId === undefined) {
    return insertUniqueChildren<T>(list, children);
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

export function updateNodeById<
  TreeType extends BasicTree<KeyAndTitle>,
  NodeType extends KeyAndTitle = TreeType
>(
  list: TreeType[],
  nodeKey: string | number,
  overrides: Partial<NodeType>
): TreeType[] {
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
