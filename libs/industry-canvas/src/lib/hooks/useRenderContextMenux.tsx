import { useCallback } from 'react';

import {
  ContextMenu,
  IdsByType,
  moveToBottom,
  moveToTop,
} from '@cognite/unified-file-viewer';

import { setNodes } from '../state/useIndustrialCanvasStore';
import { CanvasNode } from '../types';

const useRenderContextMenu = ({ nodes }: { nodes: CanvasNode[] }) => {
  const renderContextMenu = useCallback(
    ({ containerIds, annotationIds }: IdsByType) => {
      const ids = [...annotationIds, ...containerIds];
      if (ids.length === 0) {
        return null;
      }
      return (
        <ContextMenu
          items={[
            {
              label: 'Bring to front',
              icon: 'SortDescending',
              onClick: () => setNodes(moveToTop(nodes, ids)),
            },
            {
              label: 'Send to back',
              icon: 'SortAscending',
              onClick: () => setNodes(moveToBottom(nodes, ids)),
            },
          ]}
        />
      );
    },
    [nodes]
  );
  return { renderContextMenu };
};

export default useRenderContextMenu;
