import { useCallback, useEffect, useState } from 'react';
import { ContextMenuPosition } from 'src/modules/Common/Components/ContextMenu/types';
import { TableDataItem } from 'src/modules/Common/types';

export const useContextMenu = () => {
  const [contextMenuDataItem, setContextMenuDataItem] =
    useState<TableDataItem>();
  const [contextMenuAnchorPoint, setContextMenuAnchorPoint] =
    useState<ContextMenuPosition>({
      x: 0,
      y: 0,
    });
  const [showContextMenu, setShowContextMenu] = useState(false);

  // To hide context menu for all the click events
  const handleClick = useCallback(
    () => (showContextMenu ? setShowContextMenu(false) : null),
    [showContextMenu]
  );

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [handleClick]);

  return {
    contextMenuDataItem,
    contextMenuAnchorPoint,
    showContextMenu,
    setContextMenuDataItem,
    setContextMenuAnchorPoint,
    setShowContextMenu,
  };
};
