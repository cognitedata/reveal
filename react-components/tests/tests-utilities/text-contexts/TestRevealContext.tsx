/*!
 * Copyright 2024 Cognite AS
 */
import { type Cognite3DViewerOptions } from '@cognite/reveal';
import { type CogniteClient } from '@cognite/sdk';
import { type ReactNode, type ReactElement, useMemo } from 'react';
import { type Color } from 'three';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { SDKProvider } from '../../../src/components/RevealCanvas/SDKProvider';
import { CameraStateParameters } from '../../../src';
import { Reveal3DResourcesInfoContextProvider } from '../../../src/components/Reveal3DResources/Reveal3DResourcesInfoContext';
import { ViewerContextProvider } from '../../../src/components/RevealCanvas/ViewerContext';

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

  const renderTarget = createRenderTargetMock();

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
          value={renderTarget}>
          <Reveal3DResourcesInfoContextProvider>
            {props.children}
          </Reveal3DResourcesInfoContextProvider>
        </ViewerContextProvider>
      </QueryClientProvider>
    </SDKProvider>
  );
};
