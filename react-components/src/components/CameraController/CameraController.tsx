/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement, useEffect, useContext, useRef } from 'react';
import { useReveal } from '../RevealContainer/RevealContext';
import { ModelsLoadingStateContext } from '../Reveal3DResources/ModelsLoadingContext';
import { type CameraState } from '@cognite/reveal';

export type CameraControllerProps = {
  initialFitCamera?: FittingStrategy;
};

type FittingStrategy =
  | { to: 'cameraState'; state: CameraState }
  | { to: 'allModels' }
  | { to: 'none' };

export function CameraController({ initialFitCamera }: CameraControllerProps): ReactElement {
  const initialCameraSet = useRef(false);
  const viewer = useReveal();
  const { modelsAdded } = useContext(ModelsLoadingStateContext);

  const fittingStrategy: Required<FittingStrategy> = initialFitCamera ?? { to: 'allModels' };

  useEffect(() => {
    if (initialCameraSet.current) return;
    if (fittingStrategy.to === 'none') {
      initialCameraSet.current = true;
      return;
    }
    if (fittingStrategy.to === 'cameraState') {
      viewer.cameraManager.setCameraState(fittingStrategy.state);
      initialCameraSet.current = true;
      return;
    }
    if (fittingStrategy.to === 'allModels' && modelsAdded) {
      viewer.fitCameraToModels(viewer.models, 0, true);
      initialCameraSet.current = true;
    }
  }, [modelsAdded]);

  return <></>;
}
