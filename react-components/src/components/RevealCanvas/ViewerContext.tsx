/*!
 * Copyright 2023 Cognite AS
 */
import { type Cognite3DViewer } from '@cognite/reveal';
import { createContext, ReactNode, useContext } from 'react';
import { type RevealRenderTarget } from '../../architecture/base/renderTarget/RevealRenderTarget';
import { CameraStateParameters, useCameraStateControl } from './hooks/useCameraStateControl';

const ViewerContext = createContext<RevealRenderTarget | null>(null);

export const ViewerContextProvider = ({
  cameraState,
  setCameraState,
  value,
  children
}: {
  cameraState?: CameraStateParameters;
  setCameraState?: (cameraState?: CameraStateParameters) => void;
  value: RevealRenderTarget | null;
  children: ReactNode;
}) => {
  return (
    <ViewerContext.Provider value={value}>
      <ViewerControls cameraState={cameraState} setCameraState={setCameraState} />
      {children}
    </ViewerContext.Provider>
  );
};

const ViewerControls = ({
  cameraState,
  setCameraState
}: {
  cameraState?: CameraStateParameters;
  setCameraState?: (cameraState?: CameraStateParameters) => void;
}) => {
  useCameraStateControl(cameraState, setCameraState);
  return <></>;
};

export const useReveal = (): Cognite3DViewer => {
  const renderTarget = useRenderTarget();
  return renderTarget.viewer;
};

export const useRenderTarget = (): RevealRenderTarget => {
  const renderTarget = useContext(ViewerContext);
  if (renderTarget === null) {
    throw new Error('useRenderTarget must be used within a ViewerProvider');
  }
  return renderTarget;
};
