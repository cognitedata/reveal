/*!
 * Copyright 2024 Cognite AS
 */
import { type Cognite3DViewerOptions } from '@cognite/reveal';
import { type CogniteClient } from '@cognite/sdk';
import { type ReactNode, type ReactElement, useMemo } from 'react';
import { type Color } from 'three';
import { ViewerContextProvider } from '../RevealCanvas/ViewerContext';
import { Reveal3DResourcesInfoContextProvider } from '../Reveal3DResources/Reveal3DResourcesInfoContext';
import { type CameraStateParameters } from '../RevealCanvas/hooks/useCameraStateControl';
import { renderTargetMock } from '../../../tests/unit-tests/fixtures/renderTarget';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SDKProvider } from '../RevealCanvas/SDKProvider';
import { RevealRenderTarget } from '../../architecture';

export type RevealContextProps = {
  color?: Color;
  sdk: CogniteClient;
  appLanguage?: string;
  children?: ReactNode;
  useCoreDm?: boolean;
  cameraState?: CameraStateParameters;
  setCameraState?: (cameraState?: CameraStateParameters) => void;
  viewerOptions?: Cognite3DViewerOptions;
};

export const TestRevealContext = (props: RevealContextProps): ReactElement => {
  const renderTarget = new RevealRenderTarget(renderTargetMock.viewer, props.sdk);

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
        <ViewerContextProvider
          value={renderTarget}
          cameraState={props.cameraState}
          setCameraState={props.setCameraState}>
          <Reveal3DResourcesInfoContextProvider>
            {props.children}
          </Reveal3DResourcesInfoContextProvider>
        </ViewerContextProvider>
      </QueryClientProvider>
    </SDKProvider>
  );
};
