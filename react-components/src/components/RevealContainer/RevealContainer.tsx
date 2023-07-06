/*!
 * Copyright 2023 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk';
import { useEffect, useRef, type ReactNode, useState, type ReactElement } from 'react';
import { Cognite3DViewer, type Cognite3DViewerOptions } from '@cognite/reveal';
import { RevealContext } from './RevealContext';
import { type Color } from 'three';
import { ModelsLoadingStateContext } from '../Reveal3DResources/ModelsLoadingContext';
import { SDKProvider } from './SDKProvider';

type RevealContainerProps = {
  color?: Color;
  sdk: CogniteClient;
  children?: ReactNode;
  viewerOptions?: Pick<
    Cognite3DViewerOptions,
    | 'antiAliasingHint'
    | 'loadingIndicatorStyle'
    | 'rendererResolutionThreshold'
    | 'antiAliasingHint'
    | 'ssaoQualityHint'
    | 'pointCloudEffects'
    | 'enableEdges'
  >;
};

export function RevealContainer({
  children,
  sdk,
  color,
  viewerOptions
}: RevealContainerProps): ReactElement {
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
        <SDKProvider sdk={sdk}>
          <RevealContext.Provider value={viewer}>
            <ModelsLoadingProvider>
              {children}
            </ModelsLoadingProvider>
          </RevealContext.Provider>
        </SDKProvider>
      </>
    );
  }

  function initializeViewer(): void {
    const domElement = revealDomElementRef.current;
    if (domElement === null) {
      throw new Error('Failure in mounting RevealContainer to DOM.');
    }
    const viewer = new Cognite3DViewer({ ...viewerOptions, sdk, domElement });
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
