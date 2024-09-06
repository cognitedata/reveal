/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect } from 'react';
import { useReveal } from '../../..';
import { type CameraState } from '@cognite/reveal';

export type CameraStateParameters = Omit<Required<CameraState>, 'rotation'>;

export const useCameraStateControl = (
  externalCameraState?: CameraStateParameters,
  setCameraState?: (cameraState?: CameraStateParameters) => void
): void => {
  const reveal = useReveal();

  const setUrlParamOnCameraStop = (): void => {
    const currentCameraManagerState = reveal.cameraManager.getCameraState();
    if (
      externalCameraState !== undefined &&
      !hasCameraStateChanged(externalCameraState, currentCameraManagerState)
    ) {
      return;
    }

    setCameraState?.(currentCameraManagerState);
  };

  useEffect(() => {
    reveal.cameraManager.on('cameraStop', setUrlParamOnCameraStop);
    return () => {
      reveal.cameraManager.off('cameraStop', setUrlParamOnCameraStop);
    };
  }, []);
};

function hasCameraStateChanged(
  previous: CameraStateParameters,
  current: CameraStateParameters
): boolean {
  const epsilon = 0.001;
  const { position: previousPosition, target: previousTarget } = previous;
  const { position: currentPosition, target: currentTarget } = current;
  return (
    previousPosition.distanceToSquared(currentPosition) > epsilon ||
    previousTarget.distanceToSquared(currentTarget) > epsilon
  );
}
