import { type ReactNode, type ReactElement, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useReveal } from './ViewerContext';
import { useDisableBodyTextSelectionOnViewerDragging } from './hooks/useDisableBodyTextSelectionOnViewerDragging';

export function RevealCanvas({ children }: { children?: ReactNode }): ReactElement {
  const viewer = useReveal();
  const parentElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parentElement.current !== null) {
      parentElement.current.appendChild(viewer.domElement);
    }
  }, [parentElement.current]);

  useDisableBodyTextSelectionOnViewerDragging();

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }} ref={parentElement}>
      {createPortal(children, viewer.domElement)}
    </div>
  );
}
