/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useContext, useRef } from 'react';
import { useReveal } from '../RevealContainer/RevealContext';
import { ModelsLoadingStateContext } from '../Reveal3DResources/ModelsLoadingContext';
import { type CameraState } from '@cognite/reveal';

export type CameraControllerProps = {
  initialFitCamera?: { to: 'allModels' } | { to: 'cameraState'; state: CameraState };
};

export function CameraController({ initialFitCamera }: CameraControllerProps): ReactElement {
  const initialCameraSet = useRef(false);
  const viewer = useReveal();
  const { modelsAdded } = useContext(ModelsLoadingStateContext);

  useEffect(() => {
    if (initialCameraSet.current) return;
    if (initialFitCamera === undefined) {
      initialCameraSet.current = true;
      return;
    }
    if (initialFitCamera.to === 'cameraState') {
      viewer.cameraManager.setCameraState(initialFitCamera.state);
      initialCameraSet.current = true;
      return;
    }
    if (initialFitCamera.to === 'allModels' && modelsAdded) {
      viewer.fitCameraToModels(viewer.models, 0, true);
      initialCameraSet.current = true;
    }
  }, [modelsAdded]);

  return <></>;
}
