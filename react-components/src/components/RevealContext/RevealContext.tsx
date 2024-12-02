/*!
 * Copyright 2024 Cognite AS
 */
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
import { type CameraStateParameters } from '../RevealCanvas/hooks/useCameraStateControl';
import { CoreDm3dFdm3dDataProvider } from '../../data-providers/core-dm-provider/CoreDm3dDataProvider';
import { LegacyFdm3dDataProvider } from '../../data-providers/legacy-fdm-provider/LegacyFdm3dDataProvider';
import { FdmSDK } from '../../data-providers/FdmSDK';
import { CdfCaches } from '../../architecture/base/renderTarget/CdfCaches';
import { type Fdm3dDataProvider } from '../../data-providers/Fdm3dDataProvider';

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
  const fdm3dDataProvider = useFdm3dDataProvider(props.useCoreDm ?? false, props.sdk);

  const renderTarget = useRevealFromKeepAlive(props, fdm3dDataProvider);

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
    <SDKProvider sdk={props.sdk} fdm3dDataProvider={fdm3dDataProvider}>
      <QueryClientProvider client={queryClient}>
        <I18nContextProvider appLanguage={props.appLanguage}>
          <LoadedSceneProvider>
            <ViewerContextProvider
              cameraState={props.cameraState}
              setCameraState={props.setCameraState}
              value={renderTarget}>
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

const useFdm3dDataProvider = (useCoreDm: boolean, sdk: CogniteClient): Fdm3dDataProvider => {
  return useMemo(() => {}, [sdk, useCoreDm]);
};

const useRevealFromKeepAlive = ({
  color,
  sdk,
  viewerOptions,
  useCoreDm
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
      renderTarget = new RevealRenderTarget(viewer, sdk, { coreDmOnly: useCoreDm });
      if (revealKeepAliveData !== undefined) {
        revealKeepAliveData.renderTargetRef.current = renderTarget;
      }
    }
    renderTarget.viewer.setBackgroundColor({ color, alpha: 1 });
    setRenderTarget(renderTarget);
    return renderTarget;
  }
};
