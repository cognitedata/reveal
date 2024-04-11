/*!
 * Copyright 2024 Cognite AS
 */
import { useCallback, useEffect, useState } from 'react';
import { useReveal } from '../components/RevealCanvas/ViewerContext';

export const useIsDraggingOnViewer = (): boolean => {
  const viewer = useReveal();
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  const onPointerDown = useCallback(() => {
    setIsMouseDown(true);
  }, [setIsMouseDown]);

  const onPointerUp = useCallback(() => {
    setIsMouseDown(false);
  }, [setIsMouseDown]);

  useEffect(() => {
    viewer.domElement.addEventListener('pointerdown', onPointerDown);
    viewer.domElement.addEventListener('pointerup', onPointerUp);
    return () => {
      viewer.domElement.removeEventListener('pointerdown', onPointerDown);
      viewer.domElement.removeEventListener('pointerup', onPointerUp);
    };
  }, [onPointerDown, onPointerUp]);

  return isMouseDown;
};
