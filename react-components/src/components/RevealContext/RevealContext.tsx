/*!
 * Copyright 2024 Cognite AS
 */
import { Cognite3DViewer, type Cognite3DViewerOptions } from '@cognite/reveal';
import { type CogniteClient } from '@cognite/sdk/dist/src';
import { type ReactNode, useEffect, useMemo, useState, type ReactElement } from 'react';
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
import { RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';
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
    | 'onLoading'
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
                      <Reveal3DResourcesCountContextProvider>
                        {props.children}
                      </Reveal3DResourcesCountContextProvider>
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

const useRevealFromKeepAlive = ({
  color,
  sdk,
  viewerOptions
}: RevealContextProps): RevealRenderTarget | null => {
  const revealKeepAliveData = useRevealKeepAlive();

  // Double bookkeeping to satisfy test
  const [renderTarget, setRenderTarget] = useState<RevealRenderTarget | null>(null);

  useEffect(() => {
    const renderTarget = getOrInitializeRenderTarget();
    if (revealKeepAliveData === undefined) {
      return;
    }
    revealKeepAliveData.isRevealContainerMountedRef.current = true;
    return () => {
      if (revealKeepAliveData === undefined) {
        renderTarget.dispose();
        return;
      }
      revealKeepAliveData.isRevealContainerMountedRef.current = false;
    };
  }, []);

  return renderTarget;

  function getOrInitializeRenderTarget(): RevealRenderTarget {
    let renderTarget = revealKeepAliveData?.renderTargetRef.current;
    if (renderTarget === undefined) {
      const viewer = new Cognite3DViewer({ ...viewerOptions, sdk, hasEventListeners: false });
      renderTarget = new RevealRenderTarget(viewer);
      if (revealKeepAliveData !== undefined) {
        revealKeepAliveData.renderTargetRef.current = renderTarget;
      }
    }
    renderTarget.viewer.setBackgroundColor({ color, alpha: 1 });
    renderTarget.initialize();
    setRenderTarget(renderTarget);
    return renderTarget;
  }
};
