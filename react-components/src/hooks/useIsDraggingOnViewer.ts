import { useCallback, useEffect, useState } from 'react';
import { useReveal } from '../components/RevealCanvas/ViewerContext';

export const useIsDraggingOnViewer = (): boolean => {
  const viewer = useReveal();
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  const onPointerUp = useCallback(() => {
    setIsMouseDown(false);
    window.removeEventListener('pointerup', onPointerUp);
  }, [setIsMouseDown]);

  const onPointerDown = useCallback(() => {
    setIsMouseDown(true);
    window.addEventListener('pointerup', onPointerUp);
  }, [setIsMouseDown, onPointerUp]);

  useEffect(() => {
    viewer.domElement.addEventListener('pointerdown', onPointerDown);
    return () => {
      viewer.domElement.removeEventListener('pointerdown', onPointerDown);
    };
  }, [onPointerDown, viewer.domElement]);

  return isMouseDown;
};
