/*!
 * Copyright 2024 Cognite AS
 */
import { Cognite3DViewer, type Cognite3DViewerOptions } from '@cognite/reveal';
import { type CogniteClient } from '@cognite/sdk/dist/src';
import { type ReactNode, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { type Color } from 'three';
import { I18nContextProvider } from '../i18n/I18n';
import { ViewerContext } from '../RevealCanvas/ViewerContext';
import { NodeCacheProvider } from '../CacheProvider/NodeCacheProvider';
import { AssetMappingCacheProvider } from '../CacheProvider/AssetMappingCacheProvider';
import { PointCloudAnnotationCacheProvider } from '../CacheProvider/PointCloudAnnotationCacheProvider';
import { Reveal3DResourcesCountContextProvider } from '../Reveal3DResources/Reveal3DResourcesCountContext';
import { SDKProvider } from '../RevealCanvas/SDKProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { Image360AnnotationCacheProvider } from '../CacheProvider/Image360AnnotationCacheProvider';
import { LoadedSceneProvider } from '../SceneContainer/LoadedSceneContext';

export type RevealContextProps = {
  color?: Color;
  sdk: CogniteClient;
  appLanguage?: string;
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
    | 'useFlexibleCameraManager'
  >;
};

export const RevealContext = (props: RevealContextProps): ReactElement => {
  const viewer = useRevealFromKeepAlive(props);

  const queryClient = useMemo(() => {
    return new QueryClient();
  }, []);

  if (viewer === null) return <></>;

  return (
    <SDKProvider sdk={props.sdk}>
      <QueryClientProvider client={queryClient}>
        <I18nContextProvider appLanguage={props.appLanguage}>
          <LoadedSceneProvider>
            <ViewerContext.Provider value={viewer}>
              <NodeCacheProvider>
                <AssetMappingCacheProvider>
                  <PointCloudAnnotationCacheProvider>
                    <Image360AnnotationCacheProvider>
                      <Reveal3DResourcesCountContextProvider>{props.children}</Reveal3DResourcesCountContextProvider>
                    </Image360AnnotationCacheProvider>
                  </PointCloudAnnotationCacheProvider>
                </AssetMappingCacheProvider>
              </NodeCacheProvider>
            </ViewerContext.Provider>
          </LoadedSceneProvider>
        </I18nContextProvider>
      </QueryClientProvider>
    </SDKProvider>
  );
};

const useRevealFromKeepAlive = ({ color, sdk, viewerOptions }: RevealContextProps): Cognite3DViewer | null => {
  const revealKeepAliveData = useRevealKeepAlive();

  // Double bookkeeping to satisfy test
  const viewerRef = useRef<Cognite3DViewer | null>(null);
  const [, setViewer] = useState<Cognite3DViewer | undefined>(undefined);

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

  return viewerRef.current;

  function getOrInitializeViewer(): Cognite3DViewer {
    const viewer = revealKeepAliveData?.viewerRef.current ?? new Cognite3DViewer({ ...viewerOptions, sdk });
    if (revealKeepAliveData !== undefined) {
      revealKeepAliveData.viewerRef.current = viewer;
    }
    viewerDomElement.current = viewer.domElement;
    viewer.setBackgroundColor({ color, alpha: 1 });
    setViewer(viewer);
    viewerRef.current = viewer;
    return viewer;
  }
};
