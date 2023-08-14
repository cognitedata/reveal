/*!
 * Copyright 2023 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk';
import { useEffect, useRef, type ReactNode, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { Cognite3DViewer, type Cognite3DViewerOptions } from '@cognite/reveal';
import { RevealContext } from './RevealContext';
import { type Color } from 'three';
import { ModelsLoadingStateContext } from '../Reveal3DResources/ModelsLoadingContext';
import { SDKProvider } from './SDKProvider';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { RevealContainerElementContext } from './RevealContainerElementContext';

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

const queryClient = new QueryClient();

export function RevealContainer({
  children,
  sdk,
  color,
  viewerOptions
}: RevealContainerProps): ReactElement {
  const revealKeepAliveData = useRevealKeepAlive();
  const [viewer, setViewer] = useState<Cognite3DViewer>();
  const wrapperDomElement = useRef<HTMLDivElement | null>(null);
  const viewerDomElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const initializedViewer = getOrInitializeViewer();
    if (revealKeepAliveData === undefined) {
      return;
    }
    revealKeepAliveData.isRevealContainerMountedRef.current = true;
    return () => {
      if (revealKeepAliveData === undefined) {
        initializedViewer.dispose();
        return;
      }
      revealKeepAliveData.isRevealContainerMountedRef.current = false;
    };
  }, []);

  return (
    <SDKProvider sdk={sdk}>
      <QueryClientProvider client={queryClient}>
        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }} ref={wrapperDomElement}>
          {mountChildren()}
        </div>
      </QueryClientProvider>
    </SDKProvider>
  );

  function mountChildren(): ReactElement {
    if (
      viewer === undefined ||
      viewerDomElement.current === null ||
      wrapperDomElement.current === null
    )
      return <></>;
    return (
      <>
        <RevealContainerElementContext.Provider value={wrapperDomElement.current}>
          <RevealContext.Provider value={viewer}>
            <ModelsLoadingProvider>
              {createPortal(children, viewerDomElement.current)}
            </ModelsLoadingProvider>
          </RevealContext.Provider>
        </RevealContainerElementContext.Provider>
      </>
    );
  }

  function getOrInitializeViewer(): Cognite3DViewer {
    const domElement = wrapperDomElement.current;
    if (domElement === null) {
      throw new Error('Failure in mounting RevealContainer to DOM.');
    }
    const viewer =
      revealKeepAliveData?.viewerRef.current ?? new Cognite3DViewer({ ...viewerOptions, sdk });
    if (revealKeepAliveData !== undefined) {
      revealKeepAliveData.viewerRef.current = viewer;
    }
    domElement.appendChild(viewer.domElement);
    viewerDomElement.current = viewer.domElement;
    viewer.setBackgroundColor({ color, alpha: 1 });
    setViewer(viewer);
    return viewer;
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
