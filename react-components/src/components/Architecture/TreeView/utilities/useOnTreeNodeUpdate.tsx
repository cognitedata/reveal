/*!
 * Copyright 2024 Cognite AS
 */

import { useCallback, useEffect } from 'react';
import { type ITreeNode } from '../../../../architecture';

export const useOnTreeNodeUpdate = (node: ITreeNode, update: () => void): void => {
  const memoizedUpdate = useCallback(update, [node]);
  useEffect(() => {
    memoizedUpdate();
    node.addTreeNodeListener(memoizedUpdate);
    return () => {
      node.removeTreeNodeListener(memoizedUpdate);
    };
  }, [node, memoizedUpdate]);
};
