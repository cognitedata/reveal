import { useIsDraggingOnViewer } from '../../../hooks/useIsDraggingOnViewer';
import { useEffect } from 'react';

export const useDisableBodyTextSelectionOnViewerDragging = (): void => {
  const draggingOnViewer = useIsDraggingOnViewer();

  useEffect(() => {
    const body = document.getElementsByTagName('body')[0];
    if (draggingOnViewer) {
      body.style.userSelect = 'none';
    }

    return () => {
      body.style.userSelect = '';
    };
  }, [draggingOnViewer]);
};
