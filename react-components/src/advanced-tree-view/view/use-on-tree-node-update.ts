import { useEffect } from 'react';

import { type TreeNodeType } from '../model/tree-node-type';

export const useOnTreeNodeUpdate = (node: TreeNodeType | undefined, update: () => void): void => {
  useEffect(() => {
    if (node === undefined) {
      return;
    }
    update();
    node.addTreeNodeListener?.(update);
    return () => {
      node.removeTreeNodeListener?.(update);
    };
  }, [node, update]);
};
