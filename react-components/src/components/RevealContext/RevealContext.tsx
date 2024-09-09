/*!
 * Copyright 2024 Cognite AS
 */
import { Cognite3DViewer, type Cognite3DViewerOptions } from '@cognite/reveal';
import { type CogniteClient } from '@cognite/sdk/dist/src';
import { type ReactNode, useEffect, useMemo, useState, type ReactElement } from 'react';
import { type Color } from 'three';
import { I18nContextProvider } from '../i18n/I18n';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';
import { NodeCacheProvider } from '../CacheProvider/NodeCacheProvider';
import { AssetMappingAndNode3DCacheProvider } from '../CacheProvider/AssetMappingAndNode3DCacheProvider';
import { PointCloudAnnotationCacheProvider } from '../CacheProvider/PointCloudAnnotationCacheProvider';
import { Reveal3DResourcesInfoContextProvider } from '../Reveal3DResources/Reveal3DResourcesInfoContext';
import { SDKProvider } from '../RevealCanvas/SDKProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { Image360AnnotationCacheProvider } from '../CacheProvider/Image360AnnotationCacheProvider';
import { RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';
import { LoadedSceneProvider } from '../SceneContainer/LoadedSceneContext';
import { CameraStateParameters } from '../RevealCanvas/hooks/useCameraStateControl';

export type RevealContextProps = {
  color?: Color;
  sdk: CogniteClient;
  appLanguage?: string;
  children?: ReactNode;
  useCoreDm?: boolean;
  cameraState?: CameraStateParameters;
  setCameraState?: (cameraState?: CameraStateParameters) => void;
  viewerOptions?: Pick<
    Cognite3DViewerOptions,
    | 'antiAliasingHint'
    | 'loadingIndicatorStyle'
    | 'rendererResolutionThreshold'
    | 'antiAliasingHint'
    | 'ssaoQualityHint'
    | 'pointCloudEffects'
    | 'enableEdges'
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
    <SDKProvider sdk={props.sdk} useCoreDm={props.useCoreDm}>
      <QueryClientProvider client={queryClient}>
        <I18nContextProvider appLanguage={props.appLanguage}>
          <LoadedSceneProvider>
            <ViewerContextProvider
              cameraState={props.cameraState}
              setCameraState={props.setCameraState}
              value={viewer}>
              <NodeCacheProvider>
                <AssetMappingAndNode3DCacheProvider>
                  <PointCloudAnnotationCacheProvider>
                    <Image360AnnotationCacheProvider>
                      <Reveal3DResourcesInfoContextProvider>
                        {props.children}
                      </Reveal3DResourcesInfoContextProvider>
                    </Image360AnnotationCacheProvider>
                  </PointCloudAnnotationCacheProvider>
                </AssetMappingAndNode3DCacheProvider>
              </NodeCacheProvider>
            </ViewerContextProvider>
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
      const viewer = new Cognite3DViewer({
        ...viewerOptions,
        sdk,
        useFlexibleCameraManager: true,
        hasEventListeners: false
      });
      renderTarget = new RevealRenderTarget(viewer, sdk);
      if (revealKeepAliveData !== undefined) {
        revealKeepAliveData.renderTargetRef.current = renderTarget;
      }
    }
    renderTarget.viewer.setBackgroundColor({ color, alpha: 1 });
    setRenderTarget(renderTarget);
    return renderTarget;
  }
};
