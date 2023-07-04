/*!
 * Copyright 2023 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk';
import { useEffect, useRef, type ReactNode, useState, type ReactElement } from 'react';
import { Cognite3DViewer } from '@cognite/reveal';
import { RevealContext } from './RevealContext';
import { type Color } from 'three';
import { ModelsLoadingStateContext } from '../Reveal3DResources/ModelsLoadingContext';

type RevealContainerProps = {
  color?: Color;
  sdk: CogniteClient;
  children?: ReactNode;
};

export function RevealContainer({ children, sdk, color }: RevealContainerProps): ReactElement {
  const [viewer, setViewer] = useState<Cognite3DViewer>();
  const revealDomElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeViewer();
    return disposeViewer;
  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }} ref={revealDomElementRef}>
      {mountChildren()}
    </div>
  );

  function mountChildren(): ReactElement {
    if (viewer === undefined) return <></>;
    return (
      <>
        <RevealContext.Provider value={viewer}>
          <ModelsLoadingProvider>{children}</ModelsLoadingProvider>
        </RevealContext.Provider>
      </>
    );
  }

  function initializeViewer(): void {
    const domElement = revealDomElementRef.current;
    if (domElement === null) {
      throw new Error('Failure in mounting RevealContainer to DOM.');
    }
    const viewer = new Cognite3DViewer({ sdk, domElement });
    viewer.setBackgroundColor({ color, alpha: 1 });
    setViewer(viewer);
  }

  function disposeViewer(): void {
    if (viewer === undefined) return;
    viewer.dispose();
    setViewer(undefined);
  }
}

function ModelsLoadingProvider({ children }: { children?: ReactNode }): ReactElement {
  const [modelsLoading, setModelsLoading] = useState(false);
  return (
    <ModelsLoadingStateContext.Provider
      value={{ modelsAdded: modelsLoading, setModelsAdded: setModelsLoading }}>
      {children}
    </ModelsLoadingStateContext.Provider>
  );
}
