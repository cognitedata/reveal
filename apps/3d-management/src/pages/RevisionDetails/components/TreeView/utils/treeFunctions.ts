import { DataNode } from 'antd-v4/lib/tree';

export function addChildrenIntoTree<T extends DataNode>(
  list: T[],
  subtreeRootId: number | undefined,
  children: T[]
): T[] {
  if (subtreeRootId === undefined) {
    return list.concat(children);
  }
  return list.map((node) => {
    if (node.key === subtreeRootId) {
      return {
        ...node,
        children: (node.children || []).concat(children),
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

export function updateNodeById<T extends DataNode>(
  list: T[],
  nodeKey: string | number,
  overrides: Partial<T>
): T[] {
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
