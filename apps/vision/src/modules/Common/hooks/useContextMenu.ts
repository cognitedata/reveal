import { useCallback, useEffect, useState } from 'react';

import { SKIP_MENU_CLOSE_ID } from '../../../constants/ContextMenuConstants';
import { ContextMenuPosition } from '../Components/ContextMenu/types';
import { TableDataItem } from '../types';

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
    (ev: any) =>
      showContextMenu && ev.target.id !== SKIP_MENU_CLOSE_ID
        ? setShowContextMenu(false)
        : null,
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
