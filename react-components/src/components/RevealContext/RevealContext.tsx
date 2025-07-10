import { Cognite3DViewer, type DataSourceType, type Cognite3DViewerOptions } from '@cognite/reveal';
import { type CogniteClient } from '@cognite/sdk';
import { type ReactNode, useEffect, useMemo, useState, type ReactElement } from 'react';
import { type Color } from 'three';
import { I18nContextProvider } from '../i18n/I18n';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';
import { Reveal3DResourcesInfoContextProvider } from '../Reveal3DResources/Reveal3DResourcesInfoContext';
import { SDKProvider } from '../RevealCanvas/SDKProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRevealKeepAlive } from '../RevealKeepAlive/RevealKeepAliveContext';
import { RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';
import { LoadedSceneProvider } from '../SceneContainer/LoadedSceneContext';
import {
  useCameraStateControl,
  type CameraStateParameters
} from '../RevealCanvas/hooks/useCameraStateControl';

export type RevealContextProps = {
  color?: Color;
  sdk: CogniteClient;
  appLanguage?: string;
  children?: ReactNode;
  useCoreDm?: boolean;
  enableLegacy3dFdm?: boolean;
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
    | 'logMetrics'
  >;
};

export const RevealContext = (props: RevealContextProps): ReactElement => {
  const renderTarget = useRevealFromKeepAlive(props);

  const queryClient = useMemo(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false
        }
      }
    });
  }, []);

  if (renderTarget === null) return <></>;

  return (
    <SDKProvider sdk={props.sdk}>
      <QueryClientProvider client={queryClient}>
        <I18nContextProvider appLanguage={props.appLanguage}>
          <LoadedSceneProvider>
            <ViewerContextProvider value={renderTarget}>
              <ViewerControls
                cameraState={props.cameraState}
                setCameraState={props.setCameraState}
              />

              <Reveal3DResourcesInfoContextProvider>
                {props.children}
              </Reveal3DResourcesInfoContextProvider>
            </ViewerContextProvider>
          </LoadedSceneProvider>
        </I18nContextProvider>
      </QueryClientProvider>
    </SDKProvider>
  );
};

const ViewerControls = ({
  cameraState,
  setCameraState
}: {
  cameraState?: CameraStateParameters;
  setCameraState?: (cameraState?: CameraStateParameters) => void;
}): ReactNode => {
  useCameraStateControl(cameraState, setCameraState);
  return null;
};

const useRevealFromKeepAlive = ({
  color,
  sdk,
  viewerOptions,
  useCoreDm,
  enableLegacy3dFdm
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
      const viewer = new Cognite3DViewer<DataSourceType>({
        ...viewerOptions,
        sdk,
        useFlexibleCameraManager: true,
        hasEventListeners: false
      });
      renderTarget = new RevealRenderTarget(viewer, sdk, {
        coreDmOnly: useCoreDm,
        enableLegacy3dFdm
      });
      if (revealKeepAliveData !== undefined) {
        revealKeepAliveData.renderTargetRef.current = renderTarget;
      }
    }
    renderTarget.viewer.setBackgroundColor({ color, alpha: 1 });
    setRenderTarget(renderTarget);
    return renderTarget;
  }
};
